from schema import Schema, Optional, Or


class Container:
    def __init__(self, *args, **kw):
        self._args = args
        if not set(kw).issubset({'error'}):
            diff = {'error'}.difference(kw)
            raise TypeError('Unknown keyword arguments %r' % list(diff))
        self._error = kw.get('error')

    @property
    def args(self):
        return self._args

    def __repr__(self):
        return '%s(%s)' % (self.__class__.__name__, ', '.join(repr(a) for a in self._args))

    def validate(self, data):
        e = self._error
        o = Or(*self.args, error=e)
        return type(data)(o.validate(d) for d in data)


config_schema = Schema({

    # general
    Optional('debug', default=False): bool,
    Optional('admin', default=[]): Container(int),

    # api
    'api_root': str,
    'auth_key': object,
    'qq': int,

    # receiver
    Optional('host', default='0.0.0.0'): str,
    Optional('port', default=5000): int,
    Optional('endpoint', default='/mirai'): str,

    # command
    Optional('prefix', default='/'): Or(Container(str), str),

    # db
    Optional('mongo', default=False): Or(False, {
        Optional('host', default='db'): str,
        Optional('port', default=27017): int,
        Optional('username', default=''): str,
        Optional('password', default=''): str,
        Optional('db', default='bot'): str
    }),

    # plugins
    Optional('plugins'): Container(Or(
        str,
        Container(Or(str, dict)),
        {str: dict}
    ))

}, ignore_extra_keys=True)
