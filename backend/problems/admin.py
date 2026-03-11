from django.contrib import admin
from .models import Topic, Problem, Solution, Revision, UserStats

admin.site.register(Topic)
admin.site.register(Problem)
admin.site.register(Solution)
admin.site.register(Revision)
admin.site.register(UserStats)