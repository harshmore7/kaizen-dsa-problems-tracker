from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    TopicViewSet, ProblemViewSet, SolutionViewSet,
    RevisionViewSet, FetchProblemView, UserStatsView,
    ReviewQueueView, AnalyticsView
)

router = DefaultRouter()
router.register(r'topics',    TopicViewSet)
router.register(r'problems',  ProblemViewSet)
router.register(r'solutions', SolutionViewSet)
router.register(r'revisions', RevisionViewSet)

urlpatterns = [
    path('fetch-problem/', FetchProblemView.as_view()),
    path('stats/',         UserStatsView.as_view()),
    path('review-queue/', ReviewQueueView.as_view()),
    path('analytics/', AnalyticsView.as_view()),
] + router.urls