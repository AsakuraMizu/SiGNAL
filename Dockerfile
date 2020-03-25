FROM python

RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pipenv

COPY . /app

WORKDIR /app

RUN set -ex && pipenv install --deploy --system

CMD hypercorn bot:app -b 0.0.0.0:8080