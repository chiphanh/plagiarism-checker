# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AssessmentAnswers(models.Model):
    assessment = models.OneToOneField('Assessments', models.DO_NOTHING, primary_key=True)
    challenge_id = models.IntegerField()
    answer = models.JSONField(blank=True, null=True)
    order_number = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessment_answers'
        unique_together = (('challenge_id', 'order_number'),)


class AssessmentQuestions(models.Model):
    challenge = models.ForeignKey('Challenges', models.DO_NOTHING)
    question = models.CharField()

    class Meta:
        managed = False
        db_table = 'assessment_questions'
        unique_together = (('id', 'challenge'),)


class Assessments(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING)
    progress = models.ForeignKey('Progresses', models.DO_NOTHING)
    start_at = models.DateTimeField()
    mark = models.IntegerField(blank=True, null=True)
    initiator = models.ForeignKey('Users', models.DO_NOTHING, related_name='assessments_initiator_set')

    class Meta:
        managed = False
        db_table = 'assessments'


class Auth(models.Model):
    route = models.CharField(primary_key=True, max_length=255)  # The composite primary key (route, method) found, that is not supported. The first column is selected.
    permissions = models.JSONField()
    method = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'auth'
        unique_together = (('route', 'method'),)

class BranchStudents(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, branch_id) found, that is not supported. The first column is selected.
    branch = models.ForeignKey('Branches', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'branch_students'
        unique_together = (('user', 'branch'),)


class Branches(models.Model):
    name = models.CharField(unique=True)
    fos = models.ForeignKey('FieldOfStudies', models.DO_NOTHING)
    pool = models.ForeignKey('Pool', models.DO_NOTHING, blank=True, null=True)
    start_at = models.DateTimeField(blank=True, null=True)
    end_at = models.DateTimeField(blank=True, null=True)
    registration_start_at = models.DateTimeField(blank=True, null=True)
    registration_end_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'branches'


class ChallengeAccept(models.Model):
    challenge = models.OneToOneField('Challenges', models.DO_NOTHING, primary_key=True)  # The composite primary key (challenge_id, user_id) found, that is not supported. The first column is selected.
    user = models.ForeignKey('Users', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'challenge_accept'
        unique_together = (('challenge', 'user'),)


class ChallengeAccess(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, challenge_id) found, that is not supported. The first column is selected.
    challenge = models.ForeignKey('Challenges', models.DO_NOTHING)
    role_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'challenge_access'
        unique_together = (('user', 'challenge'),)


class ChallengeFiles(models.Model):
    challenge = models.ForeignKey('Challenges', models.DO_NOTHING)
    name = models.CharField()
    key = models.CharField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'challenge_files'


class ChallengeRelations(models.Model):
    prev = models.OneToOneField('Challenges', models.DO_NOTHING, db_column='prev', primary_key=True)  # The composite primary key (prev, next) found, that is not supported. The first column is selected.
    next = models.ForeignKey('Challenges', models.DO_NOTHING, db_column='next', related_name='challengerelations_next_set')

    class Meta:
        managed = False
        db_table = 'challenge_relations'
        unique_together = (('prev', 'next'),)


class ChallengeResponsible(models.Model):
    challenge = models.OneToOneField('Challenges', models.DO_NOTHING, primary_key=True)  # The composite primary key (challenge_id, user_id) found, that is not supported. The first column is selected.
    user = models.ForeignKey('Users', models.DO_NOTHING)
    percentage = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'challenge_responsible'
        unique_together = (('challenge', 'user'),)


class ChallengeSubjects(models.Model):
    challenge = models.OneToOneField('Challenges', models.DO_NOTHING, primary_key=True)  # The composite primary key (challenge_id, subject_id) found, that is not supported. The first column is selected.
    subject = models.ForeignKey('Subjects', models.DO_NOTHING)
    percentage = models.IntegerField()
    topics = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'challenge_subjects'
        unique_together = (('challenge', 'subject'),)


class ChallengeTypes(models.Model):
    name = models.CharField()

    class Meta:
        managed = False
        db_table = 'challenge_types'


class ChallengeUploadType(models.Model):
    name = models.CharField()

    class Meta:
        managed = False
        db_table = 'challenge_upload_type'


class Challenges(models.Model):
    name = models.CharField()
    summary = models.CharField(blank=True, null=True)
    type = models.ForeignKey(ChallengeTypes, models.DO_NOTHING)
    branch = models.ForeignKey(Branches, models.DO_NOTHING, blank=True, null=True)
    max_mark = models.IntegerField(blank=True, null=True)
    estimation = models.IntegerField(blank=True, null=True)
    upload_type = models.ForeignKey(ChallengeUploadType, models.DO_NOTHING, blank=True, null=True)
    assessment_number = models.IntegerField(blank=True, null=True)
    team_size = models.IntegerField(blank=True, null=True)
    auto_team = models.BooleanField(blank=True, null=True)
    allowed_mimetypes = models.JSONField(blank=True, null=True)
    start_at = models.DateTimeField(blank=True, null=True)
    end_at = models.DateTimeField(blank=True, null=True)
    dependency = models.IntegerField()
    fos = models.ForeignKey('FieldOfStudies', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'challenges'


class CheckpointAnswers(models.Model):
    progress = models.OneToOneField('Progresses', models.DO_NOTHING, primary_key=True)  # The composite primary key (progress_id, question_id) found, that is not supported. The first column is selected.
    question = models.ForeignKey('CheckpointQuestions', models.DO_NOTHING)
    answer = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'checkpoint_answers'
        unique_together = (('progress', 'question'),)


class CheckpointQuestions(models.Model):
    challenge = models.ForeignKey(Challenges, models.DO_NOTHING)
    variant = models.IntegerField()
    question = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'checkpoint_questions'


class CheckpointTemplates(models.Model):
    challenge = models.OneToOneField(Challenges, models.DO_NOTHING, primary_key=True)
    type_id = models.IntegerField()
    config = models.JSONField(blank=True, null=True)
    data = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'checkpoint_templates'

class Docs(models.Model):
    name = models.CharField()
    content = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'docs'


class DocsAccess(models.Model):
    role = models.ForeignKey('Roles', models.DO_NOTHING)
    docs = models.ForeignKey(Docs, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'docs_access'


class DocsFiles(models.Model):
    key = models.CharField(blank=True, null=True)
    used = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'docs_files'


class FieldOfStudies(models.Model):
    name = models.CharField()
    stage = models.IntegerField()
    key = models.CharField(unique=True)

    class Meta:
        managed = False
        db_table = 'field_of_studies'


class FlywaySchemaHistory(models.Model):
    installed_rank = models.IntegerField(primary_key=True)
    version = models.CharField(max_length=50, blank=True, null=True)
    description = models.CharField(max_length=200)
    type = models.CharField(max_length=20)
    script = models.CharField(max_length=1000)
    checksum = models.IntegerField(blank=True, null=True)
    installed_by = models.CharField(max_length=100)
    installed_on = models.DateTimeField()
    execution_time = models.IntegerField()
    success = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'flyway_schema_history'


class FosSubject(models.Model):
    fos = models.OneToOneField(FieldOfStudies, models.DO_NOTHING, primary_key=True)  # The composite primary key (fos_id, subject_id) found, that is not supported. The first column is selected.
    subject = models.ForeignKey('Subjects', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'fos_subject'
        unique_together = (('fos', 'subject'),)


class GlobalRoles(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField()

    class Meta:
        managed = False
        db_table = 'global_roles'


class Groups(models.Model):
    name = models.CharField()
    year = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'groups'


class Logentities(models.Model):
    name = models.CharField()

    class Meta:
        managed = False
        db_table = 'logEntities'


class Logs(models.Model):
    entity = models.ForeignKey(Logentities, models.DO_NOTHING)
    message = models.JSONField(blank=True, null=True)
    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    priority = models.IntegerField(blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'logs'


class MentorMarks(models.Model):
    progress = models.OneToOneField('Progresses', models.DO_NOTHING, primary_key=True)  # The composite primary key (progress_id, user_id) found, that is not supported. The first column is selected.
    user = models.ForeignKey('Users', models.DO_NOTHING)
    mark = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mentor_marks'
        unique_together = (('progress', 'user'),)


class PcCodeComparison(models.Model):
    plagiarismcheckid = models.ForeignKey('PcPlagiarismCheck', models.DO_NOTHING, db_column='plagiarismCheckId', blank=True, null=True)  # Field name made lowercase.
    teama = models.ForeignKey('Teams', models.DO_NOTHING, db_column='teamA', blank=True, null=True)  # Field name made lowercase.
    teamb = models.ForeignKey('Teams', models.DO_NOTHING, db_column='teamB', related_name='pccodecomparison_teamb_set', blank=True, null=True)  # Field name made lowercase.
    similarity = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pc_code_comparison'


class PcEngine(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    version = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pc_engine'


class PcPlagiarismCheck(models.Model):
    status = models.TextField()  # This field type is a guess.
    challengeid = models.ForeignKey(Challenges, models.DO_NOTHING, db_column='challengeId', blank=True, null=True)  # Field name made lowercase.
    engineid = models.ForeignKey(PcEngine, models.DO_NOTHING, db_column='engineId', blank=True, null=True)  # Field name made lowercase.
    averagesimilarity = models.FloatField(db_column='averageSimilarity', blank=True, null=True)  # Field name made lowercase.
    maxsimilarity = models.FloatField(db_column='maxSimilarity', blank=True, null=True)  # Field name made lowercase.
    supervisorid = models.ForeignKey('Users', models.DO_NOTHING, db_column='supervisorId', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'pc_plagiarism_check'


class Permissions(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, fos_id) found, that is not supported. The first column is selected.
    fos = models.ForeignKey(FieldOfStudies, models.DO_NOTHING)
    role = models.ForeignKey('Roles', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'permissions'
        unique_together = (('user', 'fos'),)


class Pool(models.Model):
    name = models.TextField()
    default_coins = models.IntegerField()
    max_coins = models.IntegerField()
    fos = models.ForeignKey(FieldOfStudies, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'pool'


class ProgressFiles(models.Model):
    progress = models.ForeignKey('Progresses', models.DO_NOTHING)
    name = models.CharField(blank=True, null=True)
    key = models.CharField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'progress_files'


class Progresses(models.Model):
    mark = models.IntegerField(blank=True, null=True)
    challenge = models.ForeignKey(Challenges, models.DO_NOTHING)
    graded_at = models.DateTimeField(blank=True, null=True)
    mentor_graded_at = models.DateTimeField(blank=True, null=True)
    status = models.IntegerField()
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True)  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt', blank=True, null=True)  # Field name made lowercase.
    team = models.ForeignKey('Teams', models.DO_NOTHING, blank=True, null=True)
    start_at = models.DateTimeField(blank=True, null=True)
    variant = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'progresses'


class ReflectionAnswers(models.Model):
    progress = models.OneToOneField(Progresses, models.DO_NOTHING, primary_key=True)  # The composite primary key (progress_id, challenge_id, question_id) found, that is not supported. The first column is selected.
    answer = models.JSONField(blank=True, null=True)
    challenge = models.ForeignKey(Challenges, models.DO_NOTHING)
    question_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'reflection_answers'
        unique_together = (('progress', 'challenge', 'question_id'),)


class ReflectionQuestions(models.Model):
    challenge = models.ForeignKey(Challenges, models.DO_NOTHING)
    question = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reflection_questions'
        unique_together = (('id', 'challenge'),)


class Roles(models.Model):
    name = models.CharField()

    class Meta:
        managed = False
        db_table = 'roles'


class Slots(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING)
    slots = models.JSONField(blank=True, null=True)
    pools = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'slots'


class StageConfirmation(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, fos_id) found, that is not supported. The first column is selected.
    fos = models.ForeignKey(FieldOfStudies, models.DO_NOTHING)
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'stage_confirmation'
        unique_together = (('user', 'fos'),)


class SubjectTeachers(models.Model):
    subject = models.OneToOneField('Subjects', models.DO_NOTHING, primary_key=True)  # The composite primary key (subject_id, user_id) found, that is not supported. The first column is selected.
    user = models.ForeignKey('Users', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'subject_teachers'
        unique_together = (('subject', 'user'),)


class Subjects(models.Model):
    name = models.CharField(unique=True)

    class Meta:
        managed = False
        db_table = 'subjects'


class TeamMembers(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, team_id) found, that is not supported. The first column is selected.
    team = models.ForeignKey('Teams', models.DO_NOTHING)
    pending = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'team_members'
        unique_together = (('user', 'team'),)


class Teams(models.Model):
    locked = models.BooleanField()
    leader = models.ForeignKey('Users', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'teams'


class UnconfirmedUsers(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)
    token = models.CharField()
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'unconfirmed_users'


class UserCoins(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)  # The composite primary key (user_id, pool_id) found, that is not supported. The first column is selected.
    pool = models.ForeignKey(Pool, models.DO_NOTHING)
    coins = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'user_coins'
        unique_together = (('user', 'pool'),)


class Users(models.Model):
    id = models.BigAutoField(primary_key=True)
    nickname = models.CharField(unique=True, blank=True, null=True)
    first_name = models.CharField()
    last_name = models.CharField()
    password = models.CharField()
    group = models.ForeignKey(Groups, models.DO_NOTHING, blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True)  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt', blank=True, null=True)  # Field name made lowercase.
    hearts = models.IntegerField(blank=True, null=True)
    is_block = models.BooleanField(blank=True, null=True)
    email = models.CharField(unique=True)
    avatar = models.CharField(blank=True, null=True)
    global_role = models.ForeignKey(GlobalRoles, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'users'


class PcDecision(models.Model):
    team = models.ForeignKey('Teams', on_delete=models.CASCADE, db_column='teamId')
    plagiarism_check = models.ForeignKey('PcPlagiarismCheck', on_delete=models.CASCADE, db_column='plagiarismCheckId')
    decision = models.CharField(max_length=50, null=True)
    supervisor = models.ForeignKey('Users', on_delete=models.CASCADE, db_column='supervisorId')

    class Meta:
        db_table = 'pc_decision'