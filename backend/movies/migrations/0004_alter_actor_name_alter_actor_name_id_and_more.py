# Generated by Django 4.2.7 on 2025-02-27 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0003_alter_movie_certificate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='actor',
            name='name',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='actor',
            name='name_id',
            field=models.CharField(max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='director',
            name='name',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='director',
            name='name_id',
            field=models.CharField(max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='movie',
            name='certificate',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='movie',
            name='imdb_id',
            field=models.CharField(max_length=50, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='movie',
            name='name',
            field=models.CharField(max_length=500),
        ),
        migrations.AlterField(
            model_name='movie',
            name='poster_url',
            field=models.URLField(blank=True, max_length=1000, null=True),
        ),
        migrations.AlterField(
            model_name='movie',
            name='rating_count',
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='movie',
            name='runtime',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='movie',
            name='year',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
