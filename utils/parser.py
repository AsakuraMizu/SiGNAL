from ast import literal_eval

def parse(s):
    try:
        return literal_eval(s)
    except:
        return s
