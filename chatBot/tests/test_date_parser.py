from datetime import date, timedelta
from date_parser import parsear_fecha, parsear_rango


def test_hoy():
    assert parsear_fecha("hoy") == date.today()
    assert parsear_fecha("el dia de hoy") == date.today()


def test_manana():
    assert parsear_fecha("mañana") == date.today() + timedelta(days=1)
    assert parsear_fecha("manana") == date.today() + timedelta(days=1)


def test_pasado_manana():
    assert parsear_fecha("pasado manana") == date.today() + timedelta(days=2)


def test_fecha_iso():
    assert parsear_fecha("2024-12-25") == date(2024, 12, 25)


def test_fecha_slash():
    assert parsear_fecha("25/12/2024") == date(2024, 12, 25)


def test_fecha_texto():
    result = parsear_fecha("15 de junio")
    assert result is not None
    assert result.day == 15
    assert result.month == 6


def test_fecha_texto_con_anio():
    assert parsear_fecha("15 de junio de 2024") == date(2024, 6, 15)


def test_dentro_de_dias():
    assert parsear_fecha("dentro de 3 días") == date.today() + timedelta(days=3)
    assert parsear_fecha("en 5 dias") == date.today() + timedelta(days=5)
    assert parsear_fecha("de aqui a 2 días") == date.today() + timedelta(days=2)


def test_dentro_de_semanas():
    result = parsear_fecha("dentro de 2 semanas")
    assert result is not None
    assert result == date.today() + timedelta(weeks=2)


def test_proxima_semana():
    result = parsear_fecha("proxima semana")
    assert result is not None
    assert result == date.today() + timedelta(days=7)


def test_proximo_mes():
    result = parsear_fecha("proximo mes")
    assert result is not None
    hoy = date.today()
    expected_month = hoy.month + 1
    expected_year = hoy.year if expected_month <= 12 else hoy.year + 1
    expected_month = ((expected_month - 1) % 12) + 1
    assert result == date(expected_year, expected_month, 1)


def test_invalid_date():
    assert parsear_fecha("") is None
    assert parsear_fecha(None) is None
    assert parsear_fecha("texto sin sentido") is None
    assert parsear_fecha("   ") is None


def test_parsear_rango():
    inicio, fin = parsear_rango("del 01/06/2024 al 05/06/2024")
    assert inicio == date(2024, 6, 1)
    assert fin == date(2024, 6, 5)


def test_parsear_rango_por_noches():
    inicio, fin = parsear_rango("01/06/2024 por 3 noches")
    assert inicio == date(2024, 6, 1)
    assert fin == date(2024, 6, 4)
