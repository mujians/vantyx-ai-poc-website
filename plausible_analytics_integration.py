"""
Plausible Analytics Integration Module
========================================

Modulo Python per l'integrazione con Plausible Analytics.
Fornisce funzioni per tracking eventi, recupero statistiche e gestione analytics.

Documentazione Plausible: https://plausible.io/docs
API Documentation: https://plausible.io/docs/events-api
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass


@dataclass
class PlausibleConfig:
    """Configurazione per Plausible Analytics"""
    domain: str
    api_key: Optional[str] = None
    script_url: str = "https://plausible.io/js/script.js"
    api_base_url: str = "https://plausible.io/api"

    @classmethod
    def from_env(cls) -> 'PlausibleConfig':
        """Carica configurazione da variabili d'ambiente"""
        return cls(
            domain=os.getenv('PLAUSIBLE_DOMAIN', 'vantyx.ai'),
            api_key=os.getenv('PLAUSIBLE_API_KEY'),
        )


class PlausibleAnalytics:
    """Client per interagire con Plausible Analytics"""

    def __init__(self, config: PlausibleConfig):
        self.config = config
        self.session = requests.Session()
        if config.api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {config.api_key}',
                'Content-Type': 'application/json'
            })

    def track_event(
        self,
        name: str,
        url: str,
        user_agent: Optional[str] = None,
        x_forwarded_for: Optional[str] = None,
        props: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Invia un evento custom a Plausible Analytics

        Args:
            name: Nome dell'evento (es. 'signup', 'purchase')
            url: URL dove è avvenuto l'evento
            user_agent: User agent del browser
            x_forwarded_for: IP del client (opzionale)
            props: Proprietà custom dell'evento (max 30 properties)

        Returns:
            True se l'evento è stato inviato con successo
        """
        endpoint = f"{self.config.api_base_url}/event"

        payload = {
            "name": name,
            "url": url,
            "domain": self.config.domain,
        }

        if props:
            payload["props"] = props

        headers = {}
        if user_agent:
            headers["User-Agent"] = user_agent
        if x_forwarded_for:
            headers["X-Forwarded-For"] = x_forwarded_for

        try:
            response = self.session.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=5
            )
            return response.status_code == 202
        except requests.RequestException as e:
            print(f"Errore nell'invio evento: {e}")
            return False

    def get_aggregate_stats(
        self,
        period: str = "30d",
        metrics: Optional[List[str]] = None,
        filters: Optional[Dict[str, str]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Recupera statistiche aggregate

        Args:
            period: Periodo di analisi (7d, 30d, month, 6mo, 12mo, custom)
            metrics: Lista di metriche da recuperare
            filters: Filtri da applicare

        Returns:
            Dizionario con le statistiche o None in caso di errore
        """
        if not self.config.api_key:
            raise ValueError("API key richiesta per recuperare statistiche")

        endpoint = f"{self.config.api_base_url}/v1/stats/aggregate"

        params = {
            "site_id": self.config.domain,
            "period": period,
        }

        if metrics:
            params["metrics"] = ",".join(metrics)

        if filters:
            for key, value in filters.items():
                params[f"filters[{key}]"] = value

        try:
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Errore nel recupero statistiche: {e}")
            return None

    def get_timeseries(
        self,
        period: str = "30d",
        metrics: Optional[List[str]] = None,
        interval: str = "date"
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Recupera serie temporale delle metriche

        Args:
            period: Periodo di analisi
            metrics: Lista di metriche
            interval: Intervallo temporale (date, month)

        Returns:
            Lista di dati temporali o None
        """
        if not self.config.api_key:
            raise ValueError("API key richiesta per recuperare serie temporali")

        endpoint = f"{self.config.api_base_url}/v1/stats/timeseries"

        params = {
            "site_id": self.config.domain,
            "period": period,
            "interval": interval,
        }

        if metrics:
            params["metrics"] = ",".join(metrics)

        try:
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json().get("results", [])
        except requests.RequestException as e:
            print(f"Errore nel recupero serie temporale: {e}")
            return None

    def get_breakdown(
        self,
        property: str,
        period: str = "30d",
        metrics: Optional[List[str]] = None,
        limit: int = 100
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Recupera breakdown di una proprietà specifica

        Args:
            property: Proprietà da analizzare (page, source, country, etc.)
            period: Periodo di analisi
            metrics: Lista di metriche
            limit: Numero massimo di risultati

        Returns:
            Lista di breakdown o None
        """
        if not self.config.api_key:
            raise ValueError("API key richiesta per recuperare breakdown")

        endpoint = f"{self.config.api_base_url}/v1/stats/breakdown"

        params = {
            "site_id": self.config.domain,
            "period": period,
            "property": property,
            "limit": limit,
        }

        if metrics:
            params["metrics"] = ",".join(metrics)

        try:
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json().get("results", [])
        except requests.RequestException as e:
            print(f"Errore nel recupero breakdown: {e}")
            return None

    def get_realtime_visitors(self) -> Optional[int]:
        """
        Recupera numero di visitatori in tempo reale

        Returns:
            Numero di visitatori attivi o None
        """
        if not self.config.api_key:
            raise ValueError("API key richiesta")

        endpoint = f"{self.config.api_base_url}/v1/stats/realtime/visitors"

        params = {"site_id": self.config.domain}

        try:
            response = self.session.get(endpoint, params=params, timeout=5)
            response.raise_for_status()
            return response.json().get("visitors", 0)
        except requests.RequestException as e:
            print(f"Errore nel recupero visitatori realtime: {e}")
            return None

    def create_goal(self, goal_type: str, goal_value: str) -> bool:
        """
        Crea un nuovo goal in Plausible

        Args:
            goal_type: Tipo di goal ('event' o 'page')
            goal_value: Valore del goal (nome evento o URL pagina)

        Returns:
            True se il goal è stato creato con successo
        """
        if not self.config.api_key:
            raise ValueError("API key richiesta per creare goals")

        endpoint = f"{self.config.api_base_url}/v1/sites/goals"

        payload = {
            "site_id": self.config.domain,
            "goal_type": goal_type,
            "event_name": goal_value if goal_type == "event" else None,
            "page_path": goal_value if goal_type == "page" else None,
        }

        try:
            response = self.session.put(endpoint, json=payload, timeout=5)
            return response.status_code == 200
        except requests.RequestException as e:
            print(f"Errore nella creazione del goal: {e}")
            return False

    def get_frontend_script_tag(self, custom_domain: bool = False) -> str:
        """
        Genera il tag script per il frontend

        Args:
            custom_domain: Se True, usa un custom domain setup

        Returns:
            HTML script tag da inserire nel frontend
        """
        script_url = self.config.script_url

        return f'''<script defer data-domain="{self.config.domain}" src="{script_url}"></script>'''

    def generate_config_json(self) -> str:
        """
        Genera un file di configurazione JSON per il frontend

        Returns:
            JSON string con configurazione Plausible
        """
        config = {
            "domain": self.config.domain,
            "scriptUrl": self.config.script_url,
            "trackLocalhost": False,
            "enableAutoPageviews": True,
            "enableAutoOutboundTracking": True,
        }

        return json.dumps(config, indent=2)


# Helper functions per eventi comuni
def track_signup(analytics: PlausibleAnalytics, url: str, user_agent: str = None) -> bool:
    """Track evento di signup utente"""
    return analytics.track_event(
        name="signup",
        url=url,
        user_agent=user_agent,
        props={"type": "user_registration"}
    )


def track_purchase(
    analytics: PlausibleAnalytics,
    url: str,
    amount: float,
    currency: str = "USD",
    user_agent: str = None
) -> bool:
    """Track evento di acquisto"""
    return analytics.track_event(
        name="purchase",
        url=url,
        user_agent=user_agent,
        props={
            "amount": amount,
            "currency": currency,
            "type": "conversion"
        }
    )


def track_form_submission(
    analytics: PlausibleAnalytics,
    url: str,
    form_name: str,
    user_agent: str = None
) -> bool:
    """Track invio form"""
    return analytics.track_event(
        name="form_submit",
        url=url,
        user_agent=user_agent,
        props={"form": form_name}
    )


# Esempio di utilizzo
if __name__ == "__main__":
    # Carica configurazione da environment
    config = PlausibleConfig.from_env()
    analytics = PlausibleAnalytics(config)

    # Genera script tag per frontend
    print("Script tag per HTML:")
    print(analytics.get_frontend_script_tag())
    print()

    # Genera configurazione JSON
    print("Configurazione JSON:")
    print(analytics.generate_config_json())
    print()

    # Esempio di tracking evento (richiede API key)
    if config.api_key:
        # Track evento custom
        success = analytics.track_event(
            name="test_event",
            url="https://vantyx.ai/test",
            props={"test": "true"}
        )
        print(f"Evento inviato: {success}")

        # Recupera statistiche aggregate
        stats = analytics.get_aggregate_stats(
            period="30d",
            metrics=["visitors", "pageviews", "bounce_rate", "visit_duration"]
        )
        if stats:
            print(f"\nStatistiche 30 giorni:")
            print(json.dumps(stats, indent=2))

        # Recupera visitatori in tempo reale
        realtime = analytics.get_realtime_visitors()
        if realtime is not None:
            print(f"\nVisitatori in tempo reale: {realtime}")
    else:
        print("API key non configurata. Imposta PLAUSIBLE_API_KEY per funzionalità avanzate.")
