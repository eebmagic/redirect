Run these commands to:

1. See if the service is running:
```
  sudo systemctl status redirect-server.service
```

2. Restart the service:
```
  sudo systemctl restart redirect-server.service
```

3. Check the logs for the service
```
  sudo journalctl -u redirect-server
```
