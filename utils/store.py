import pickle
from pathlib import Path

DIR = Path(__file__).parent.parent / "data" / "processed"

def _p(name):
    DIR.mkdir(parents=True, exist_ok=True)
    return DIR / name

def save(obj, name): pickle.dump(obj, open(_p(name), "wb"))
def load(name): return pickle.load(open(_p(name), "rb"))
def exists(*names): return all(_p(n).exists() for n in names)
def clear():
    for f in DIR.glob("*.pkl"):
        f.unlink()
