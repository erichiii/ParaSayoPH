import requests

url = "https://api.brightdata.com/dca/trigger"
headers = {
	"Authorization": "API_KEY",
	"Content-Type": "application/json",
}
params = {
	"collector": "c_msx143oawff2k64gn",
	"queue_next": "1",
}
data = [
	{"url":"https://scholarship.com.ph/"},
]

response = requests.post(url, headers=headers, params=params, json=data)
print(response.json())