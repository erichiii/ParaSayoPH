import importlib
import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "test-key")


def _reload_app_with_origins(origins: str | None):
    if origins is None:
        os.environ.pop("CORS_ORIGINS", None)
    else:
        os.environ["CORS_ORIGINS"] = origins
    import app.main as main

    importlib.reload(main)
    return main


def test_default_origins_include_localhost():
    main = _reload_app_with_origins(None)
    origins = main._get_cors_origins()
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins
    assert "*" not in origins


def test_custom_origins_parsed_and_wildcard_rejected():
    main = _reload_app_with_origins("https://app.example.com, https://api.example.com , https://app.example.com/")
    origins = main._get_cors_origins()
    assert "https://app.example.com" in origins
    assert "https://api.example.com" in origins
    assert "*" not in origins
    # trailing slash stripped
    assert "https://app.example.com/" not in origins

    main2 = _reload_app_with_origins("*, https://app.example.com")
    origins2 = main2._get_cors_origins()
    assert "*" not in origins2
    assert "https://app.example.com" in origins2


def test_allowed_origin_get_has_cors_header():
    main = _reload_app_with_origins("https://allowed.example.com,http://localhost:5173")
    client = TestClient(main.app)
    response = client.get("/health", headers={"Origin": "https://allowed.example.com"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://allowed.example.com"


def test_disallowed_origin_no_cors_header():
    main = _reload_app_with_origins("https://allowed.example.com")
    client = TestClient(main.app)
    response = client.get("/health", headers={"Origin": "https://evil.example.com"})
    # CORSMiddleware does not echo disallowed origins
    assert response.headers.get("access-control-allow-origin") != "https://evil.example.com"


def test_preflight_allowed_origin():
    main = _reload_app_with_origins("https://allowed.example.com")
    client = TestClient(main.app)
    response = client.options(
        "/programs",
        headers={
            "Origin": "https://allowed.example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    # Preflight should succeed for allowed origin
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://allowed.example.com"
    allow_methods = response.headers.get("access-control-allow-methods", "")
    assert "POST" in allow_methods
    assert "GET" in allow_methods
    assert "OPTIONS" in allow_methods


def test_preflight_disallowed_origin_no_cors():
    main = _reload_app_with_origins("https://allowed.example.com")
    client = TestClient(main.app)
    response = client.options(
        "/programs",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    # Disallowed origin should not be echoed
    assert response.headers.get("access-control-allow-origin") != "https://evil.example.com"


def teardown_module():
    # Restore default for other tests
    os.environ.pop("CORS_ORIGINS", None)
    import app.main as main

    importlib.reload(main)
