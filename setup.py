from setuptools import setup

setup(
    name='translation',
    packages=['translation'],
    include_package_data=True,
    install_requires=[
        'flask',
        'requests',
        'futures',
        'flask-bootstrap',
        'googletrans',
        'yandex.translate',
        'flask-webpack',
    ],
    version='0.1',
    author='Alfie Mendoza',
    author_email='alfie.mendoza929@gmail.com',
    description='An app that translates words from voice input.'
)
