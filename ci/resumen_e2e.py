"""Resumen en Markdown del junit.xml de pytest (pruebas E2E), para $GITHUB_STEP_SUMMARY.

Uso: python3 ci/resumen_e2e.py e2e/reportes/junit.xml
"""
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path


def archivo_de(classname):
    """tests.test_login.TestX -> test_login.py"""
    for parte in classname.split("."):
        if parte.startswith("test_"):
            return f"{parte}.py"
    return classname or "(sin archivo)"


def main(ruta):
    if not Path(ruta).is_file():
        print("No hay resultados de las pruebas E2E: fallo un paso anterior a pytest.")
        return

    por_archivo = defaultdict(lambda: {"pasaron": 0, "fallaron": 0, "omitidas": 0, "tiempo": 0.0})
    for caso in ET.parse(ruta).getroot().iter("testcase"):
        fila = por_archivo[archivo_de(caso.get("classname", ""))]
        fila["tiempo"] += float(caso.get("time") or 0)
        if caso.find("failure") is not None or caso.find("error") is not None:
            fila["fallaron"] += 1
        elif caso.find("skipped") is not None:
            fila["omitidas"] += 1
        else:
            fila["pasaron"] += 1

    print("| Archivo | Estado | Pasaron | Fallaron | Omitidas | Duracion |")
    print("|---|---|---:|---:|---:|---:|")
    total = {"pasaron": 0, "fallaron": 0, "omitidas": 0, "tiempo": 0.0}
    for archivo, fila in sorted(por_archivo.items()):
        estado = "FALLO" if fila["fallaron"] else "OK"
        print(f"| `{archivo}` | {estado} | {fila['pasaron']} | {fila['fallaron']} | {fila['omitidas']} | {fila['tiempo']:.1f} s |")
        for clave in total:
            total[clave] += fila[clave]
    print(f"| **Total** | | **{total['pasaron']}** | **{total['fallaron']}** | **{total['omitidas']}** "
          f"| **{total['tiempo'] / 60:.1f} min** |")


if __name__ == "__main__":
    main(sys.argv[1])
