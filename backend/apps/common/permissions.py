from rest_framework import permissions

class IsAdminOrManager(permissions.BasePermission):
    """
    Allows access only to Admin or Manager users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or 
            getattr(request.user, 'role', '') in ['ADMIN', 'MANAGER']
        )


class IsAccountantOrAdmin(permissions.BasePermission):
    """
    Allows access to Finance and Payroll only for Accountant, Admin, or Superuser.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or 
            getattr(request.user, 'role', '') in ['ADMIN', 'ACCOUNTANT']
        )

