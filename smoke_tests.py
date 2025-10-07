"""
Smoke Tests Post-Deploy per Vantyx.ai POC
==========================================

Test automatici per verificare il funzionamento base dell'applicazione
dopo il deployment in staging utilizzando Playwright.

Esegui i test con:
    python smoke_tests.py --env staging
    python smoke_tests.py --env production
"""

import os
import sys
import json
import argparse
from datetime import datetime
from playwright.sync_api import sync_playwright, expect


class VantyxSmokeTests:
    """Suite di smoke tests per Vantyx.ai POC"""

    def __init__(self, base_url: str, environment: str = "staging"):
        self.base_url = base_url.rstrip('/')
        self.environment = environment
        self.test_results = []
        self.start_time = None

    def log_test(self, test_name: str, status: str, message: str = ""):
        """Log risultato test"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)

        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {test_name}: {status}")
        if message:
            print(f"   └─ {message}")

    def test_health_check(self, page) -> bool:
        """Test 1: Health Check Endpoint"""
        try:
            response = page.request.get(f"{self.base_url}/health")

            if response.status != 200:
                self.log_test("Health Check", "FAIL",
                            f"Status code: {response.status}")
                return False

            data = response.json()

            # Verifica struttura response
            if "status" not in data:
                self.log_test("Health Check", "FAIL",
                            "Missing 'status' field")
                return False

            if data["status"] != "healthy":
                self.log_test("Health Check", "FAIL",
                            f"Status is '{data['status']}' instead of 'healthy'")
                return False

            # Verifica environment corretto
            if "environment" in data and data["environment"] != self.environment:
                self.log_test("Health Check", "WARN",
                            f"Environment mismatch: {data['environment']} vs {self.environment}")

            self.log_test("Health Check", "PASS",
                        f"Status: {data['status']}, Env: {data.get('environment', 'N/A')}")
            return True

        except Exception as e:
            self.log_test("Health Check", "FAIL", str(e))
            return False

    def test_homepage_loads(self, page) -> bool:
        """Test 2: Homepage carica correttamente"""
        try:
            response = page.goto(self.base_url, wait_until="networkidle", timeout=30000)

            if response.status != 200:
                self.log_test("Homepage Load", "FAIL",
                            f"Status code: {response.status}")
                return False

            # Verifica presenza elementi chiave
            page.wait_for_selector("body", timeout=5000)

            self.log_test("Homepage Load", "PASS",
                        f"Loaded in {response.request.timing.get('responseEnd', 0):.2f}ms")
            return True

        except Exception as e:
            self.log_test("Homepage Load", "FAIL", str(e))
            return False

    def test_ui_components_render(self, page) -> bool:
        """Test 3: Componenti UI principali sono renderizzati"""
        try:
            # Verifica presenza root app
            app_root = page.locator("#root")
            expect(app_root).to_be_visible(timeout=5000)

            # Conta componenti renderizzati
            components_found = []

            # Check per componenti comuni (adatta in base alla tua UI)
            selectors = {
                "Logo": "[data-testid='logo'], .logo, svg",
                "Chat Interface": "[data-testid='chat'], .chat-container, textarea, input[type='text']",
                "Buttons": "button",
            }

            for name, selector in selectors.items():
                elements = page.locator(selector).count()
                if elements > 0:
                    components_found.append(f"{name} ({elements})")

            if not components_found:
                self.log_test("UI Components", "FAIL",
                            "No UI components found")
                return False

            self.log_test("UI Components", "PASS",
                        f"Found: {', '.join(components_found)}")
            return True

        except Exception as e:
            self.log_test("UI Components", "FAIL", str(e))
            return False

    def test_no_js_errors(self, page) -> bool:
        """Test 4: Nessun errore JavaScript in console"""
        try:
            js_errors = []

            def handle_console(msg):
                if msg.type == "error":
                    js_errors.append(msg.text)

            page.on("console", handle_console)

            # Reload page per catturare errori
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(2000)  # Wait for async errors

            if js_errors:
                self.log_test("JS Errors", "FAIL",
                            f"Found {len(js_errors)} error(s): {js_errors[0][:100]}")
                return False

            self.log_test("JS Errors", "PASS", "No console errors")
            return True

        except Exception as e:
            self.log_test("JS Errors", "FAIL", str(e))
            return False

    def test_api_cors_configured(self, page) -> bool:
        """Test 5: CORS è configurato correttamente"""
        try:
            # Prova una richiesta API di base
            response = page.request.get(f"{self.base_url}/health")

            headers = response.headers

            # Verifica header CORS
            cors_headers = [
                "access-control-allow-origin",
                "access-control-allow-methods",
            ]

            missing_headers = [h for h in cors_headers if h not in headers]

            if missing_headers:
                self.log_test("CORS Configuration", "WARN",
                            f"Missing headers: {', '.join(missing_headers)}")
                return True  # Warning, non fail

            self.log_test("CORS Configuration", "PASS",
                        f"CORS headers present")
            return True

        except Exception as e:
            self.log_test("CORS Configuration", "FAIL", str(e))
            return False

    def test_security_headers(self, page) -> bool:
        """Test 6: Security headers sono configurati"""
        try:
            response = page.goto(self.base_url)
            headers = response.headers

            # Header di sicurezza raccomandati
            security_headers = {
                "x-content-type-options": "nosniff",
                "x-frame-options": ["DENY", "SAMEORIGIN"],
                "content-security-policy": None,  # Solo verifica presenza
            }

            missing = []
            present = []

            for header, expected_value in security_headers.items():
                if header not in headers:
                    missing.append(header)
                else:
                    present.append(header)

            if missing:
                self.log_test("Security Headers", "WARN",
                            f"Missing: {', '.join(missing)}")
            else:
                self.log_test("Security Headers", "PASS",
                            f"Present: {', '.join(present)}")

            return True  # Warning only, not critical

        except Exception as e:
            self.log_test("Security Headers", "FAIL", str(e))
            return False

    def test_responsive_design(self, page) -> bool:
        """Test 7: Design responsivo (mobile viewport)"""
        try:
            # Test mobile viewport
            page.set_viewport_size({"width": 375, "height": 667})  # iPhone SE
            page.reload(wait_until="networkidle")

            # Verifica che il contenuto sia visibile
            body = page.locator("body")
            expect(body).to_be_visible()

            # Verifica no horizontal scroll
            scroll_width = page.evaluate("document.body.scrollWidth")
            client_width = page.evaluate("document.body.clientWidth")

            if scroll_width > client_width + 10:  # 10px tolerance
                self.log_test("Responsive Design", "WARN",
                            f"Horizontal overflow detected: {scroll_width}px > {client_width}px")
            else:
                self.log_test("Responsive Design", "PASS",
                            "Mobile viewport renders correctly")

            # Reset viewport
            page.set_viewport_size({"width": 1280, "height": 720})

            return True

        except Exception as e:
            self.log_test("Responsive Design", "FAIL", str(e))
            return False

    def test_performance_metrics(self, page) -> bool:
        """Test 8: Metriche di performance di base"""
        try:
            # Naviga e misura timing
            page.goto(self.base_url, wait_until="load")

            # Get performance metrics
            metrics = page.evaluate("""
                () => {
                    const perfData = window.performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;

                    return {
                        loadTime: loadTime,
                        domReady: domReady
                    };
                }
            """)

            load_time = metrics.get("loadTime", 0)
            dom_ready = metrics.get("domReady", 0)

            # Thresholds (in ms)
            if load_time > 5000:  # 5 seconds
                self.log_test("Performance", "WARN",
                            f"Slow load time: {load_time}ms")
            else:
                self.log_test("Performance", "PASS",
                            f"Load: {load_time}ms, DOM: {dom_ready}ms")

            return True

        except Exception as e:
            self.log_test("Performance", "FAIL", str(e))
            return False

    def run_all_tests(self):
        """Esegui tutti i smoke tests"""
        print(f"\n{'='*60}")
        print(f"🔍 Vantyx.ai POC - Smoke Tests")
        print(f"{'='*60}")
        print(f"Environment: {self.environment}")
        print(f"Base URL: {self.base_url}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        self.start_time = datetime.now()

        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Playwright Smoke Tests)"
            )
            page = context.new_page()

            # Run tests
            tests = [
                self.test_health_check,
                self.test_homepage_loads,
                self.test_ui_components_render,
                self.test_no_js_errors,
                self.test_api_cors_configured,
                self.test_security_headers,
                self.test_responsive_design,
                self.test_performance_metrics,
            ]

            for test in tests:
                try:
                    test(page)
                except Exception as e:
                    self.log_test(test.__name__, "ERROR", str(e))

            # Cleanup
            browser.close()

        self.print_summary()

    def print_summary(self):
        """Stampa summary dei risultati"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()

        # Count results
        passed = len([r for r in self.test_results if r["status"] == "PASS"])
        failed = len([r for r in self.test_results if r["status"] == "FAIL"])
        warnings = len([r for r in self.test_results if r["status"] == "WARN"])
        errors = len([r for r in self.test_results if r["status"] == "ERROR"])
        total = len(self.test_results)

        print(f"\n{'='*60}")
        print(f"📊 Test Summary")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"💥 Errors: {errors}")
        print(f"⏱️  Duration: {duration:.2f}s")
        print(f"{'='*60}\n")

        # Save results to file
        self.save_results()

        # Exit code
        if failed > 0 or errors > 0:
            print("❌ Smoke tests FAILED")
            sys.exit(1)
        else:
            print("✅ Smoke tests PASSED")
            sys.exit(0)

    def save_results(self):
        """Salva risultati in file JSON"""
        results = {
            "environment": self.environment,
            "base_url": self.base_url,
            "timestamp": self.start_time.isoformat(),
            "duration": (datetime.now() - self.start_time).total_seconds(),
            "tests": self.test_results,
            "summary": {
                "total": len(self.test_results),
                "passed": len([r for r in self.test_results if r["status"] == "PASS"]),
                "failed": len([r for r in self.test_results if r["status"] == "FAIL"]),
                "warnings": len([r for r in self.test_results if r["status"] == "WARN"]),
                "errors": len([r for r in self.test_results if r["status"] == "ERROR"]),
            }
        }

        filename = f"smoke_test_results_{self.environment}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"📄 Results saved to: {filename}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Run smoke tests for Vantyx.ai POC"
    )
    parser.add_argument(
        "--env",
        choices=["staging", "production"],
        default="staging",
        help="Environment to test (default: staging)"
    )
    parser.add_argument(
        "--url",
        type=str,
        help="Custom base URL (overrides environment default)"
    )

    args = parser.parse_args()

    # Determine base URL
    if args.url:
        base_url = args.url
    else:
        # Default URLs (aggiorna con i tuoi URL reali)
        env_urls = {
            "staging": os.getenv("STAGING_URL", "https://vantyx-poc-backend-staging.onrender.com"),
            "production": os.getenv("PRODUCTION_URL", "https://vantyx-poc-backend.onrender.com")
        }
        base_url = env_urls[args.env]

    # Run tests
    tester = VantyxSmokeTests(base_url=base_url, environment=args.env)
    tester.run_all_tests()


if __name__ == "__main__":
    main()
