from rest_framework.response import Response
from rest_framework import status

def api_response(success=True, message="", data=None, status_code=status.HTTP_200_OK, errors=None):
    """
    Standardized API response helper for consistent frontend responses.
    """
    payload = {
        'success': success,
        'message': message,
        'data': data if data is not None else {}
    }
    if errors is not None:
        payload['errors'] = errors
    return Response(payload, status=status_code)

