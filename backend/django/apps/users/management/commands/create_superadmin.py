from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superadmin user for the admin portal'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--username', type=str, help='Admin username')

    def handle(self, *args, **options):
        # Default superadmin credentials
        email = options.get('email') or 'admin@fontainesante.com'
        password = options.get('password') or 'AdminPass123!'
        username = options.get('username') or 'superadmin'
        
        # Required fields
        first_name = 'Super'
        last_name = 'Admin'
        staff_id = 'ADMIN001'
        phone_number = '+1234567890'
        position = 'System Administrator'
        
        # Security questions (required by your model)
        security_question_1 = "What is your favorite color?"
        security_answer_1 = "blue"
        security_question_2 = "What city were you born in?"
        security_answer_2 = "montreal"

        try:
            # Check if superuser already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'Superuser with email {email} already exists!')
                )
                existing_user = User.objects.get(email=email)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Existing superuser credentials:\n'
                        f'Email: {existing_user.email}\n'
                        f'Username: {existing_user.username}\n'
                        f'Use the password you set when creating this user.'
                    )
                )
                return

            # Create superuser
            user = User.objects.create_superuser(
                email=email,
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                staff_id=staff_id,
                phone_number=phone_number,
                position=position,
                security_question_1=security_question_1,
                security_answer_1=security_answer_1,
                security_question_2=security_question_2,
                security_answer_2=security_answer_2,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Superadmin created successfully!\n\n'
                    f'Frontend Admin Portal Credentials:\n'
                    f'URL: http://localhost:3000/admin/login\n'
                    f'Username: {username}\n'
                    f'Password: {password}\n\n'
                    f'Django Admin Credentials:\n'
                    f'URL: http://localhost:8000/admin/\n'
                    f'Email: {email}\n'
                    f'Password: {password}\n\n'
                    f'Security Questions (for password recovery):\n'
                    f'Q1: {security_question_1} -> A1: {security_answer_1}\n'
                    f'Q2: {security_question_2} -> A2: {security_answer_2}\n'
                )
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {e}')
            ) 