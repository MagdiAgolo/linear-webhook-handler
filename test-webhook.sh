#!/bin/bash

# Test webhook locally
curl -X POST http://localhost:3000/api/linear-webhook \
  -H "Content-Type: application/json" \
  -H "linear-signature-type: issue.updated" \
  -d '{
    "data": {
      "id": "test-issue-id",
      "identifier": "TEST-123",
      "title": "Test Issue",
      "state": {
        "name": "Done"
      },
      "team": {
        "id": "test-team-id"
      }
    }
  }' 