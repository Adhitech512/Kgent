import { DatabaseSync } from 'node:sqlite';

export class OfflineDatabase {
  private db: DatabaseSync;

  constructor(dbPath: string = 'kgent.db') {
    this.db = new DatabaseSync(dbPath);
    console.log(`Initialized Fully Offline Local Database Wrapper at ${dbPath}`);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS personal_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS link_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS group_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id TEXT,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS global_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  saveContext(layer: 'personal' | 'link' | 'group' | 'global', key: string, data: any) {
    const jsonContext = JSON.stringify(data);
    let stmt;
    switch (layer) {
      case 'personal':
        stmt = this.db.prepare('INSERT INTO personal_memory (agent_id, context) VALUES (?, ?)');
        break;
      case 'link':
        stmt = this.db.prepare('INSERT INTO link_memory (link_id, context) VALUES (?, ?)');
        break;
      case 'group':
        stmt = this.db.prepare('INSERT INTO group_memory (workspace_id, context) VALUES (?, ?)');
        break;
      case 'global':
        stmt = this.db.prepare('INSERT OR REPLACE INTO global_memory (key, context) VALUES (?, ?)');
        break;
    }
    stmt.run(key, jsonContext);
    console.log(`Saved to offline db [${layer}]: ${key}`);
  }

  getContext(layer: 'personal' | 'link' | 'group' | 'global', key: string): any {
    let stmt;
    switch (layer) {
      case 'personal':
        stmt = this.db.prepare('SELECT context FROM personal_memory WHERE agent_id = ? ORDER BY timestamp DESC LIMIT 1');
        break;
      case 'link':
        stmt = this.db.prepare('SELECT context FROM link_memory WHERE link_id = ? ORDER BY timestamp DESC LIMIT 1');
        break;
      case 'group':
        stmt = this.db.prepare('SELECT context FROM group_memory WHERE workspace_id = ? ORDER BY timestamp DESC LIMIT 1');
        break;
      case 'global':
        stmt = this.db.prepare('SELECT context FROM global_memory WHERE key = ?');
        break;
    }
    const row = stmt.get(key) as { context: string } | undefined;
    return row ? JSON.parse(row.context) : null;
  }
}
