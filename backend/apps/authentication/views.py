from rest_framework import generics, status, permissions
from rest_framework.response import Response
from apps.common.utils import api_response
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserLoginSerializer
from apps.common.permissions import IsAdminOrManager

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_response(
            success=True,
            message="User registered successfully.",
            data=UserSerializer(user).data,
            status_code=status.HTTP_201_CREATED
        )


class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        user = validated_data['user']
        tokens = validated_data['tokens']

        return api_response(
            success=True,
            message="Login successful.",
            data={
                'user': UserSerializer(user).data,
                'tokens': tokens
            }
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['role', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']

