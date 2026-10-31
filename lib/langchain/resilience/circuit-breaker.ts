/**
 * In-Memory Circuit Breaker for LLM and Provider APIs
 * Prevents cascading latency during outages and fast-fails quota-exhausted models.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  /** Number of consecutive failures before tripping the breaker */
  failureThreshold: number;
  /** Cooldown time in ms before transitioning from OPEN to HALF_OPEN */
  cooldownMs: number;
}

interface ServiceCircuit {
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  cooldownMs: 60 * 1000, // 60 seconds
};

class CircuitBreakerRegistry {
  private circuits = new Map<string, ServiceCircuit>();

  private getOrCreate(service: string): ServiceCircuit {
    let circuit = this.circuits.get(service);
    if (!circuit) {
      circuit = {
        state: "CLOSED",
        consecutiveFailures: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };
      this.circuits.set(service, circuit);
    }
    return circuit;
  }

  /**
   * Check if a service is available to receive requests.
   * Automatically transitions from OPEN to HALF_OPEN if cooldown has expired.
   */
  public isAvailable(service: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): boolean {
    const circuit = this.getOrCreate(service);
    const now = Date.now();

    if (circuit.state === "CLOSED") {
      return true;
    }

    if (circuit.state === "OPEN") {
      if (now >= circuit.nextAttemptTime) {
        // Cooldown passed: allow probe request in HALF_OPEN state
        circuit.state = "HALF_OPEN";
        return true;
      }
      return false; // Fast-fail; do not hammer the outage
    }

    if (circuit.state === "HALF_OPEN") {
      // In probe state; allow traffic
      return true;
    }

    return true;
  }

  /**
   * Record a successful operation; resets circuit back to CLOSED
   */
  public recordSuccess(service: string): void {
    const circuit = this.getOrCreate(service);
    circuit.state = "CLOSED";
    circuit.consecutiveFailures = 0;
  }

  /**
   * Record a failure. If quota exhaustion is detected, trip to OPEN immediately.
   */
  public recordFailure(
    service: string,
    isQuotaExhausted = false,
    config: CircuitBreakerConfig = DEFAULT_CONFIG
  ): void {
    const circuit = this.getOrCreate(service);
    circuit.consecutiveFailures++;
    circuit.lastFailureTime = Date.now();

    // Daily quota exhaustion trips the circuit breaker immediately for the full cooldown
    if (isQuotaExhausted || circuit.consecutiveFailures >= config.failureThreshold) {
      circuit.state = "OPEN";
      // If daily quota exhausted, use longer cooldown (5 minutes); otherwise default cooldown (1 minute)
      const cooldown = isQuotaExhausted ? 5 * 60 * 1000 : config.cooldownMs;
      circuit.nextAttemptTime = Date.now() + cooldown;
      console.warn(
        `[CIRCUIT_BREAKER] Tripped ${service} to OPEN state. Fast-failing for ${cooldown / 1000}s.`
      );
    }
  }

  /**
   * Inspect current state for telemetry or debugging
   */
  public getState(service: string): { state: CircuitState; consecutiveFailures: number } {
    const circuit = this.getOrCreate(service);
    return {
      state: circuit.state,
      consecutiveFailures: circuit.consecutiveFailures,
    };
  }

  /**
   * Reset all circuits (useful for tests)
   */
  public reset(): void {
    this.circuits.clear();
  }
}

export const circuitBreaker = new CircuitBreakerRegistry();
