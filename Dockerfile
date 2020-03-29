FROM python

# Uncomment these two lines if you are in mainland China.
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
ENV PIPENV_PYPI_MIRROR https://pypi.tuna.tsinghua.edu.cn/simple

RUN pip install pipenv

COPY . /app

WORKDIR /app

RUN set -ex && pipenv install --deploy --system

CMD hypercorn bot:app -b 0.0.0.0:8080