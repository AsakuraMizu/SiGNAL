FROM python:alpine

RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && export PIPENV_PYPI_MIRROR=https://pypi.tuna.tsinghua.edu.cn/simple

RUN pip install pipenv

WORKDIR /app

COPY Pipfile* /app/

RUN pipenv lock --requirements | sed "1 d" > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD pipenv run start
