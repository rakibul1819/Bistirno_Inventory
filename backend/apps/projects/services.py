from django.utils import timezone
from .models import Project, ProjectMilestone

class ProjectProgressService:
    @staticmethod
    def recalculate_project_progress(project: Project) -> int:
        """
        Recalculates progress percentage based on completed milestones.
        """
        milestones = project.milestones.all()
        if not milestones.exists():
            return project.progress_percentage

        total_weight = sum(m.weight_percentage for m in milestones)
        if total_weight == 0:
            return 0

        completed_weight = sum(m.weight_percentage for m in milestones if m.is_completed)
        progress = int((completed_weight / total_weight) * 100)
        progress = min(100, max(0, progress))

        project.progress_percentage = progress
        if progress == 100 and project.status != Project.Status.COMPLETED:
            project.status = Project.Status.COMPLETED
            project.actual_end_date = timezone.now().date()
        project.save(update_fields=['progress_percentage', 'status', 'actual_end_date'])

        return progress

