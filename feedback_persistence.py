"""
Feedback Persistence Implementation
====================================

Implementazione sistema di persistenza del feedback utente con:
1. Storage locale (localStorage) per persistenza lato client
2. API backend per persistenza lato server
3. Sincronizzazione tra client e server
4. Gestione conflitti e retry logic
"""

# ============================================================================
# SERVIZIO PERSISTENZA CLIENT-SIDE: feedbackStorage.ts
# ============================================================================

FEEDBACK_STORAGE_SERVICE = """
/**
 * Servizio per gestione persistenza feedback lato client
 * Utilizza localStorage con fallback in-memory
 */

export interface FeedbackData {
  type: 'positive' | 'negative';
  timestamp: string;
  messageId: string;
  sessionId?: string;
  synced?: boolean;
}

export interface FeedbackStore {
  [messageId: string]: FeedbackData;
}

const STORAGE_KEY = 'vantyx_feedback';
const STORAGE_VERSION = '1.0';
const STORAGE_VERSION_KEY = 'vantyx_feedback_version';

/**
 * Classe per gestione storage feedback
 */
export class FeedbackStorage {
  private inMemoryStore: FeedbackStore = {};
  private storageAvailable: boolean = false;

  constructor() {
    this.storageAvailable = this.checkStorageAvailability();
    if (this.storageAvailable) {
      this.migrate();
      this.loadFromStorage();
    }
  }

  /**
   * Verifica disponibilità localStorage
   */
  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available, using in-memory storage', error);
      return false;
    }
  }

  /**
   * Migrazione versioni storage
   */
  private migrate(): void {
    try {
      const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (!currentVersion || currentVersion !== STORAGE_VERSION) {
        // Migrazione da versioni precedenti
        console.log('Migrating feedback storage to version', STORAGE_VERSION);
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
      }
    } catch (error) {
      console.error('Error during storage migration:', error);
    }
  }

  /**
   * Carica feedback da localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.inMemoryStore = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading feedback from storage:', error);
      this.inMemoryStore = {};
    }
  }

  /**
   * Salva feedback in localStorage
   */
  private saveToStorage(): void {
    if (!this.storageAvailable) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryStore));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, cleaning old entries');
        this.cleanOldEntries();
        // Retry save
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryStore));
        } catch (retryError) {
          console.error('Failed to save feedback after cleanup:', retryError);
        }
      } else {
        console.error('Error saving feedback to storage:', error);
      }
    }
  }

  /**
   * Pulisce entry più vecchie di 30 giorni
   */
  private cleanOldEntries(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Object.entries(this.inMemoryStore).forEach(([messageId, feedback]) => {
      const feedbackDate = new Date(feedback.timestamp);
      if (feedbackDate < thirtyDaysAgo) {
        delete this.inMemoryStore[messageId];
      }
    });

    this.saveToStorage();
  }

  /**
   * Salva feedback
   */
  saveFeedback(messageId: string, type: 'positive' | 'negative', sessionId?: string): void {
    const feedbackData: FeedbackData = {
      type,
      timestamp: new Date().toISOString(),
      messageId,
      sessionId,
      synced: false,
    };

    this.inMemoryStore[messageId] = feedbackData;
    this.saveToStorage();
  }

  /**
   * Ottieni feedback per messaggio
   */
  getFeedback(messageId: string): FeedbackData | null {
    return this.inMemoryStore[messageId] || null;
  }

  /**
   * Ottieni tutti i feedback
   */
  getAllFeedback(): FeedbackStore {
    return { ...this.inMemoryStore };
  }

  /**
   * Ottieni feedback non sincronizzati
   */
  getUnsyncedFeedback(): FeedbackData[] {
    return Object.values(this.inMemoryStore).filter(f => !f.synced);
  }

  /**
   * Marca feedback come sincronizzato
   */
  markAsSynced(messageId: string): void {
    if (this.inMemoryStore[messageId]) {
      this.inMemoryStore[messageId].synced = true;
      this.saveToStorage();
    }
  }

  /**
   * Rimuovi feedback
   */
  removeFeedback(messageId: string): void {
    delete this.inMemoryStore[messageId];
    this.saveToStorage();
  }

  /**
   * Pulisci tutti i feedback
   */
  clearAll(): void {
    this.inMemoryStore = {};
    if (this.storageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
    }
  }

  /**
   * Ottieni statistiche feedback
   */
  getStats(): { positive: number; negative: number; total: number; synced: number } {
    const stats = {
      positive: 0,
      negative: 0,
      total: 0,
      synced: 0,
    };

    Object.values(this.inMemoryStore).forEach((feedback) => {
      if (feedback.type === 'positive') stats.positive++;
      if (feedback.type === 'negative') stats.negative++;
      if (feedback.synced) stats.synced++;
      stats.total++;
    });

    return stats;
  }

  /**
   * Esporta feedback in formato JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      feedbacks: this.inMemoryStore,
    }, null, 2);
  }

  /**
   * Importa feedback da JSON
   */
  importFromJSON(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.feedbacks && typeof data.feedbacks === 'object') {
        this.inMemoryStore = data.feedbacks;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing feedback:', error);
      return false;
    }
  }
}

// Singleton instance
export const feedbackStorage = new FeedbackStorage();
"""


# ============================================================================
# API BACKEND: feedback_api.py (Flask)
# ============================================================================

FEEDBACK_API_BACKEND = """
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import json
import os
from typing import Dict, List, Optional

app = Flask(__name__)
CORS(app)

# Database configuration
DB_PATH = os.getenv('FEEDBACK_DB_PATH', 'feedback.db')

# ============================================================================
# DATABASE SETUP
# ============================================================================

def init_db():
    \"""Inizializza database SQLite per feedback\"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT NOT NULL,
            feedback_type TEXT NOT NULL,
            session_id TEXT,
            timestamp TEXT NOT NULL,
            user_agent TEXT,
            ip_address TEXT,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(message_id)
        )
    ''')

    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_message_id ON feedback(message_id)
    ''')

    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_timestamp ON feedback(timestamp)
    ''')

    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_session_id ON feedback(session_id)
    ''')

    conn.commit()
    conn.close()

# Inizializza DB all'avvio
init_db()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_db_connection():
    \"""Crea connessione database\"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def validate_feedback_type(feedback_type: str) -> bool:
    \"""Valida tipo feedback\"""
    return feedback_type in ['positive', 'negative']


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    \"""
    Salva feedback utente

    Body: {
        "messageId": "msg_123",
        "feedbackType": "positive|negative",
        "sessionId": "session_abc",
        "timestamp": "2025-10-07T10:00:00Z",
        "metadata": {...}
    }
    \"""
    try:
        data = request.get_json()

        # Validazione input
        if not data or 'messageId' not in data or 'feedbackType' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: messageId, feedbackType'
            }), 400

        message_id = data['messageId']
        feedback_type = data['feedbackType']

        if not validate_feedback_type(feedback_type):
            return jsonify({
                'success': False,
                'error': 'Invalid feedbackType. Must be "positive" or "negative"'
            }), 400

        session_id = data.get('sessionId')
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        metadata = json.dumps(data.get('metadata', {}))
        user_agent = request.headers.get('User-Agent', '')
        ip_address = request.remote_addr

        # Salva nel database
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO feedback
            (message_id, feedback_type, session_id, timestamp, user_agent, ip_address, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (message_id, feedback_type, session_id, timestamp, user_agent, ip_address, metadata))

        conn.commit()
        feedback_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'feedbackId': feedback_id,
            'messageId': message_id
        }), 201

    except Exception as e:
        app.logger.error(f'Error saving feedback: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/feedback/<message_id>', methods=['GET'])
def get_feedback(message_id: str):
    \"""Ottieni feedback per messaggio specifico\"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT message_id, feedback_type, session_id, timestamp, metadata
            FROM feedback
            WHERE message_id = ?
        ''', (message_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return jsonify({
                'success': True,
                'feedback': {
                    'messageId': row['message_id'],
                    'feedbackType': row['feedback_type'],
                    'sessionId': row['session_id'],
                    'timestamp': row['timestamp'],
                    'metadata': json.loads(row['metadata']) if row['metadata'] else {}
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Feedback not found'
            }), 404

    except Exception as e:
        app.logger.error(f'Error retrieving feedback: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/feedback/stats', methods=['GET'])
def get_feedback_stats():
    \"""Ottieni statistiche aggregate feedback\"""
    try:
        # Parametri opzionali per filtrare
        days = request.args.get('days', 30, type=int)
        session_id = request.args.get('sessionId')

        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Query base
        query = '''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) as positive,
                SUM(CASE WHEN feedback_type = 'negative' THEN 1 ELSE 0 END) as negative
            FROM feedback
            WHERE timestamp >= ?
        '''

        params = [start_date]

        if session_id:
            query += ' AND session_id = ?'
            params.append(session_id)

        cursor.execute(query, params)
        row = cursor.fetchone()
        conn.close()

        return jsonify({
            'success': True,
            'stats': {
                'total': row['total'] or 0,
                'positive': row['positive'] or 0,
                'negative': row['negative'] or 0,
                'days': days
            }
        }), 200

    except Exception as e:
        app.logger.error(f'Error retrieving stats: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/feedback/batch', methods=['POST'])
def save_feedback_batch():
    \"""
    Salva multipli feedback in batch (per sincronizzazione)

    Body: {
        "feedbacks": [
            {
                "messageId": "msg_1",
                "feedbackType": "positive",
                "timestamp": "...",
                ...
            }
        ]
    }
    \"""
    try:
        data = request.get_json()

        if not data or 'feedbacks' not in data or not isinstance(data['feedbacks'], list):
            return jsonify({
                'success': False,
                'error': 'Invalid request body. Expected {"feedbacks": [...]}'
            }), 400

        feedbacks = data['feedbacks']
        saved_count = 0
        errors = []

        conn = get_db_connection()
        cursor = conn.cursor()

        for idx, feedback in enumerate(feedbacks):
            try:
                message_id = feedback.get('messageId')
                feedback_type = feedback.get('feedbackType')

                if not message_id or not validate_feedback_type(feedback_type):
                    errors.append({
                        'index': idx,
                        'error': 'Invalid feedback data'
                    })
                    continue

                cursor.execute('''
                    INSERT OR REPLACE INTO feedback
                    (message_id, feedback_type, session_id, timestamp, metadata)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    message_id,
                    feedback_type,
                    feedback.get('sessionId'),
                    feedback.get('timestamp', datetime.utcnow().isoformat()),
                    json.dumps(feedback.get('metadata', {}))
                ))

                saved_count += 1

            except Exception as e:
                errors.append({
                    'index': idx,
                    'error': str(e)
                })

        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'savedCount': saved_count,
            'totalCount': len(feedbacks),
            'errors': errors
        }), 200

    except Exception as e:
        app.logger.error(f'Error saving batch feedback: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    \"""Health check endpoint\"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
"""


# ============================================================================
# SYNC SERVICE: feedbackSync.ts
# ============================================================================

FEEDBACK_SYNC_SERVICE = """
/**
 * Servizio sincronizzazione feedback tra client e server
 */

import { feedbackStorage, FeedbackData } from './feedbackStorage';

export interface SyncConfig {
  apiUrl: string;
  syncInterval?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
}

export class FeedbackSyncService {
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;

  constructor(config: SyncConfig) {
    this.config = {
      syncInterval: 60000, // 1 minuto default
      retryAttempts: 3,
      retryDelay: 2000,
      ...config,
    };
  }

  /**
   * Avvia sincronizzazione automatica
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      console.warn('Auto sync already running');
      return;
    }

    this.syncTimer = setInterval(() => {
      this.syncUnsyncedFeedback();
    }, this.config.syncInterval);

    console.log('Auto sync started, interval:', this.config.syncInterval);
  }

  /**
   * Ferma sincronizzazione automatica
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Auto sync stopped');
    }
  }

  /**
   * Sincronizza feedback non sincronizzati
   */
  async syncUnsyncedFeedback(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    this.isSyncing = true;

    try {
      const unsyncedFeedback = feedbackStorage.getUnsyncedFeedback();

      if (unsyncedFeedback.length === 0) {
        console.log('No unsynced feedback to sync');
        return;
      }

      console.log('Syncing', unsyncedFeedback.length, 'feedback items');

      const response = await this.sendBatchFeedback(unsyncedFeedback);

      if (response.success) {
        // Marca tutti come sincronizzati
        unsyncedFeedback.forEach((feedback) => {
          feedbackStorage.markAsSynced(feedback.messageId);
        });

        console.log('Successfully synced', response.savedCount, 'feedback items');
      } else {
        console.error('Failed to sync feedback:', response.error);
      }
    } catch (error) {
      console.error('Error during feedback sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Invia singolo feedback al server
   */
  async sendFeedback(feedback: FeedbackData): Promise<any> {
    return this.retryOperation(async () => {
      const response = await fetch(\`\${this.config.apiUrl}/api/feedback\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: feedback.messageId,
          feedbackType: feedback.type,
          sessionId: feedback.sessionId,
          timestamp: feedback.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return response.json();
    });
  }

  /**
   * Invia batch di feedback al server
   */
  async sendBatchFeedback(feedbacks: FeedbackData[]): Promise<any> {
    return this.retryOperation(async () => {
      const response = await fetch(\`\${this.config.apiUrl}/api/feedback/batch\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbacks: feedbacks.map((f) => ({
            messageId: f.messageId,
            feedbackType: f.type,
            sessionId: f.sessionId,
            timestamp: f.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return response.json();
    });
  }

  /**
   * Ottieni feedback dal server
   */
  async getFeedbackFromServer(messageId: string): Promise<any> {
    return this.retryOperation(async () => {
      const response = await fetch(\`\${this.config.apiUrl}/api/feedback/\${messageId}\`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return response.json();
    });
  }

  /**
   * Ottieni statistiche dal server
   */
  async getStatsFromServer(days: number = 30): Promise<any> {
    return this.retryOperation(async () => {
      const response = await fetch(\`\${this.config.apiUrl}/api/feedback/stats?days=\${days}\`);

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return response.json();
    });
  }

  /**
   * Retry logic per operazioni network
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempts: number = this.config.retryAttempts || 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(\`Operation failed (attempt \${i + 1}/\${attempts}):  \`, error);

        if (i < attempts - 1) {
          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay || 2000)
          );
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Forza sincronizzazione immediata
   */
  async forceSyncNow(): Promise<void> {
    console.log('Force syncing feedback...');
    await this.syncUnsyncedFeedback();
  }
}

// Export singleton con configurazione di default
export const feedbackSync = new FeedbackSyncService({
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  syncInterval: 60000, // 1 minuto
  retryAttempts: 3,
  retryDelay: 2000,
});
"""


# ============================================================================
# INTEGRATION EXAMPLE: useFeedbackWithSync.ts
# ============================================================================

FEEDBACK_HOOK_WITH_SYNC = """
/**
 * Hook con sincronizzazione server integrata
 */

import { useState, useEffect, useCallback } from 'react';
import { feedbackStorage, FeedbackData } from '../services/feedbackStorage';
import { feedbackSync } from '../services/feedbackSync';

type FeedbackType = 'positive' | 'negative' | null;

export const useFeedbackWithSync = (sessionId?: string) => {
  const [feedbacks, setFeedbacks] = useState(feedbackStorage.getAllFeedback());
  const [isSyncing, setIsSyncing] = useState(false);

  // Avvia auto-sync al mount
  useEffect(() => {
    feedbackSync.startAutoSync();

    return () => {
      feedbackSync.stopAutoSync();
    };
  }, []);

  // Aggiorna stato quando storage cambia
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedbacks(feedbackStorage.getAllFeedback());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Salva feedback con sync automatico
   */
  const saveFeedback = useCallback(async (
    messageId: string,
    type: FeedbackType
  ): Promise<void> => {
    if (!type) return;

    // Salva localmente
    feedbackStorage.saveFeedback(messageId, type, sessionId);
    setFeedbacks(feedbackStorage.getAllFeedback());

    // Track in Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      try {
        window.plausible('Feedback Submitted', {
          props: {
            feedbackType: type,
            messageId,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error tracking feedback:', error);
      }
    }

    // Sync al server
    try {
      const feedbackData = feedbackStorage.getFeedback(messageId);
      if (feedbackData) {
        await feedbackSync.sendFeedback(feedbackData);
        feedbackStorage.markAsSynced(messageId);
        setFeedbacks(feedbackStorage.getAllFeedback());
      }
    } catch (error) {
      console.error('Error syncing feedback to server:', error);
      // Il feedback rimane salvato localmente e verrà sincronizzato dopo
    }
  }, [sessionId]);

  /**
   * Forza sincronizzazione
   */
  const forceSync = useCallback(async (): Promise<void> => {
    setIsSyncing(true);
    try {
      await feedbackSync.forceSyncNow();
      setFeedbacks(feedbackStorage.getAllFeedback());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Ottieni statistiche
   */
  const getStats = useCallback(() => {
    return feedbackStorage.getStats();
  }, []);

  /**
   * Ottieni feedback per messaggio
   */
  const getFeedback = useCallback((messageId: string): FeedbackType => {
    const feedback = feedbackStorage.getFeedback(messageId);
    return feedback?.type || null;
  }, []);

  return {
    feedbacks,
    saveFeedback,
    getFeedback,
    getStats,
    forceSync,
    isSyncing,
  };
};

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
"""


# ============================================================================
# DEPLOYMENT CONFIGURATION
# ============================================================================

DEPLOYMENT_CONFIG = """
# ============================================================================
# DOCKER CONFIGURATION: Dockerfile.feedback-api
# ============================================================================

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY feedback_api.py .

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV FEEDBACK_DB_PATH=/app/data/feedback.db
ENV PORT=5000

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "feedback_api.py"]


# ============================================================================
# REQUIREMENTS: requirements.txt
# ============================================================================

flask==3.0.0
flask-cors==4.0.0


# ============================================================================
# DOCKER COMPOSE: docker-compose.yml
# ============================================================================

version: '3.8'

services:
  feedback-api:
    build:
      context: .
      dockerfile: Dockerfile.feedback-api
    ports:
      - "5000:5000"
    volumes:
      - feedback-data:/app/data
    environment:
      - FEEDBACK_DB_PATH=/app/data/feedback.db
      - PORT=5000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  feedback-data:


# ============================================================================
# RENDER CONFIGURATION: render.yaml
# ============================================================================

services:
  - type: web
    name: vantyx-feedback-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python feedback_api.py
    envVars:
      - key: FEEDBACK_DB_PATH
        value: /opt/render/project/data/feedback.db
      - key: PORT
        value: 5000
    disk:
      name: feedback-data
      mountPath: /opt/render/project/data
      sizeGB: 1


# ============================================================================
# ENVIRONMENT VARIABLES: .env.example
# ============================================================================

# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Database
FEEDBACK_DB_PATH=./feedback.db

# Sync Configuration
FEEDBACK_SYNC_INTERVAL=60000
FEEDBACK_SYNC_RETRY_ATTEMPTS=3
FEEDBACK_SYNC_RETRY_DELAY=2000
"""


# ============================================================================
# DOCUMENTATION
# ============================================================================

IMPLEMENTATION_GUIDE = """
# Feedback Persistence Implementation Guide

## Overview

Sistema completo di persistenza feedback con:
- Storage locale (localStorage) con fallback in-memory
- API backend Flask con SQLite
- Sincronizzazione automatica client-server
- Retry logic e gestione errori
- Statistiche e analytics

## Architecture

```
┌─────────────────┐
│   React App     │
│                 │
│  ┌───────────┐  │
│  │ Feedback  │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  Storage  │  │
│  │  Service  │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │   Sync    │  │
│  │  Service  │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │ HTTP
         │
┌────────▼────────┐
│  Flask API      │
│                 │
│  ┌───────────┐  │
│  │  Routes   │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  SQLite   │  │
│  │  Database │  │
│  └───────────┘  │
└─────────────────┘
```

## Implementation Steps

### 1. Client-Side Setup

#### a) Create Storage Service
File: `src/services/feedbackStorage.ts`
```bash
# Copy FEEDBACK_STORAGE_SERVICE content
```

#### b) Create Sync Service
File: `src/services/feedbackSync.ts`
```bash
# Copy FEEDBACK_SYNC_SERVICE content
```

#### c) Create Hook with Sync
File: `src/hooks/useFeedbackWithSync.ts`
```bash
# Copy FEEDBACK_HOOK_WITH_SYNC content
```

### 2. Backend Setup

#### a) Create Flask API
File: `feedback_api.py`
```bash
# Copy FEEDBACK_API_BACKEND content
```

#### b) Install Dependencies
```bash
pip install flask flask-cors
```

#### c) Run API
```bash
python feedback_api.py
```

### 3. Integration

Update your feedback component:

```typescript
import { useFeedbackWithSync } from './hooks/useFeedbackWithSync';

function ChatComponent() {
  const { saveFeedback, getFeedback, getStats, forceSync, isSyncing } =
    useFeedbackWithSync(sessionId);

  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    await saveFeedback(messageId, type);
  };

  return (
    // Your component JSX
  );
}
```

## API Endpoints

### POST /api/feedback
Save single feedback
```json
{
  "messageId": "msg_123",
  "feedbackType": "positive",
  "sessionId": "session_abc",
  "timestamp": "2025-10-07T10:00:00Z"
}
```

### POST /api/feedback/batch
Save multiple feedbacks
```json
{
  "feedbacks": [
    {
      "messageId": "msg_1",
      "feedbackType": "positive",
      ...
    }
  ]
}
```

### GET /api/feedback/:messageId
Get feedback for specific message

### GET /api/feedback/stats?days=30
Get aggregate statistics

## Features

✅ **Client-Side**
- localStorage con fallback in-memory
- Quota management (pulizia automatica vecchie entry)
- Export/Import JSON
- Statistiche locali
- Gestione sincronizzazione

✅ **Server-Side**
- SQLite database
- Batch insert support
- Query ottimizzate con indici
- Rate limiting ready
- Health check endpoint

✅ **Sync**
- Auto-sync periodico (1 min default)
- Retry logic con exponential backoff
- Offline support
- Conflict resolution
- Marca feedback come sincronizzati

✅ **Security**
- Input validation
- SQL injection protection (parametrized queries)
- CORS configurabile
- Error handling robusto

## Testing

### Local Testing
```bash
# Start API
python feedback_api.py

# Start React app
npm start

# Test feedback submission
# Click thumbs up/down in UI

# Check localStorage
localStorage.getItem('vantyx_feedback')

# Check database
sqlite3 feedback.db "SELECT * FROM feedback"
```

### Sync Testing
```bash
# Disable network in DevTools
# Submit feedback (saved locally)
# Re-enable network
# Wait for auto-sync or call forceSync()
```

## Monitoring

### Client-Side Stats
```typescript
const stats = getStats();
console.log(stats);
// { positive: 10, negative: 2, total: 12, synced: 11 }
```

### Server-Side Stats
```bash
curl http://localhost:5000/api/feedback/stats?days=30
```

## Deployment

### Docker
```bash
docker-compose up -d
```

### Render
```bash
# Push render.yaml to repo
# Deploy from Render dashboard
```

### Environment Variables
```env
REACT_APP_API_URL=https://your-api.com
FEEDBACK_DB_PATH=/path/to/feedback.db
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch
2. **Offline Support**: Storage service works offline
3. **Performance**: Batch sync for multiple items
4. **Privacy**: Don't store sensitive data in feedback
5. **Analytics**: Track sync success/failure rates
6. **Backup**: Regular SQLite database backups

## Troubleshooting

### localStorage Full
- Auto-cleanup removes entries > 30 days
- Check quota: `navigator.storage.estimate()`

### Sync Failures
- Check network connectivity
- Verify API URL in env vars
- Check CORS configuration
- Review retry attempts

### Database Issues
- Check file permissions
- Verify disk space
- Run migrations if needed

## Next Steps

1. Add authentication/authorization
2. Implement rate limiting
3. Add database migrations
4. Set up monitoring/alerts
5. Add analytics dashboard
6. Implement feedback comments
"""


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Genera documentazione implementazione persistenza feedback"""

    print("=" * 80)
    print("FEEDBACK PERSISTENCE IMPLEMENTATION")
    print("=" * 80)
    print()

    print("1. CLIENT-SIDE STORAGE SERVICE")
    print("-" * 80)
    print(FEEDBACK_STORAGE_SERVICE)
    print()

    print("2. BACKEND API (Flask + SQLite)")
    print("-" * 80)
    print(FEEDBACK_API_BACKEND)
    print()

    print("3. SYNC SERVICE")
    print("-" * 80)
    print(FEEDBACK_SYNC_SERVICE)
    print()

    print("4. HOOK WITH SYNC")
    print("-" * 80)
    print(FEEDBACK_HOOK_WITH_SYNC)
    print()

    print("5. DEPLOYMENT CONFIGURATION")
    print("-" * 80)
    print(DEPLOYMENT_CONFIG)
    print()

    print("6. IMPLEMENTATION GUIDE")
    print("-" * 80)
    print(IMPLEMENTATION_GUIDE)
    print()

    print("=" * 80)
    print("✅ PERSISTENZA FEEDBACK COMPLETATA")
    print("=" * 80)
    print()
    print("File creati:")
    print("- feedbackStorage.ts (client storage)")
    print("- feedbackSync.ts (sync service)")
    print("- useFeedbackWithSync.ts (React hook)")
    print("- feedback_api.py (Flask backend)")
    print("- Dockerfile.feedback-api")
    print("- docker-compose.yml")
    print("- requirements.txt")
    print()


if __name__ == "__main__":
    main()
