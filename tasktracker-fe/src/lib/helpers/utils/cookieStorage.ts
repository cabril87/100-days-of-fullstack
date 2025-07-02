/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

interface ColumnPreferences {
  boardId: number;
  columnOrder: number[];
  columnColors: Record<number, string>;
  columnNames: Record<number, string>;
  lastModified: string;
}

interface BoardPreferences {
  viewMode: 'kanban' | 'list';
  sortBy: 'created' | 'updated' | 'priority' | 'dueDate';
  filterTags: string[];
  compactMode: boolean;
}

class CookieStorage {
  private static COLUMN_PREFS_KEY = 'tasktracker_column_prefs';
  private static BOARD_PREFS_KEY = 'tasktracker_board_prefs';
  private static EXPIRY_DAYS = 30;

  /**
   * Set a cookie with expiration
   */
  private static setCookie(name: string, value: string, days: number = this.EXPIRY_DAYS): void {
    if (typeof document === 'undefined') return; // SSR check
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null; // SSR check
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Save column preferences for a specific board
   */
  static saveColumnPreferences(boardId: number, prefs: Partial<Omit<ColumnPreferences, 'boardId' | 'lastModified'>>): void {
    try {
      const existingPrefs = this.getColumnPreferences(boardId);
      const updatedPrefs: ColumnPreferences = {
        boardId,
        columnOrder: prefs.columnOrder || existingPrefs?.columnOrder || [],
        columnColors: { ...existingPrefs?.columnColors, ...prefs.columnColors },
        columnNames: { ...existingPrefs?.columnNames, ...prefs.columnNames },
        lastModified: new Date().toISOString()
      };

      this.setCookie(this.COLUMN_PREFS_KEY, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save column preferences:', error);
    }
  }

  /**
   * Get column preferences for a specific board
   */
  static getColumnPreferences(boardId: number): ColumnPreferences | null {
    try {
      const cookie = this.getCookie(this.COLUMN_PREFS_KEY);
      if (!cookie) return null;

      const prefs: ColumnPreferences = JSON.parse(cookie);
      return prefs.boardId === boardId ? prefs : null;
    } catch (error) {
      console.error('Failed to load column preferences:', error);
      return null;
    }
  }

  /**
   * Save board preferences
   */
  static saveBoardPreferences(boardId: number, prefs: Partial<BoardPreferences>): void {
    try {
      const existingPrefs = this.getBoardPreferences(boardId);
      const updatedPrefs = {
        ...existingPrefs,
        ...prefs
      };

      this.setCookie(`${this.BOARD_PREFS_KEY}_${boardId}`, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save board preferences:', error);
    }
  }

  /**
   * Get board preferences
   */
  static getBoardPreferences(boardId: number): BoardPreferences {
    try {
      const cookie = this.getCookie(`${this.BOARD_PREFS_KEY}_${boardId}`);
      if (!cookie) {
        return {
          viewMode: 'kanban',
          sortBy: 'created',
          filterTags: [],
          compactMode: false
        };
      }

      return JSON.parse(cookie);
    } catch (error) {
      console.error('Failed to load board preferences:', error);
      return {
        viewMode: 'kanban',
        sortBy: 'created',
        filterTags: [],
        compactMode: false
      };
    }
  }

  /**
   * Clear all preferences for a board
   */
  static clearBoardPreferences(boardId: number): void {
    if (typeof document === 'undefined') return;
    
    // Clear column preferences
    document.cookie = `${this.COLUMN_PREFS_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    
    // Clear board preferences
    document.cookie = `${this.BOARD_PREFS_KEY}_${boardId}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Get column color preference
   */
  static getColumnColor(boardId: number, columnId: number): string | null {
    const prefs = this.getColumnPreferences(boardId);
    return prefs?.columnColors[columnId] || null;
  }

  /**
   * Save column color preference
   */
  static saveColumnColor(boardId: number, columnId: number, color: string): void {
    this.saveColumnPreferences(boardId, {
      columnColors: { [columnId]: color }
    });
  }

  /**
   * Get column name preference
   */
  static getColumnName(boardId: number, columnId: number): string | null {
    const prefs = this.getColumnPreferences(boardId);
    return prefs?.columnNames[columnId] || null;
  }

  /**
   * Save column name preference
   */
  static saveColumnName(boardId: number, columnId: number, name: string): void {
    this.saveColumnPreferences(boardId, {
      columnNames: { [columnId]: name }
    });
  }

  /**
   * Clear column preferences for a specific column
   */
  static clearColumnPreferences(boardId: number, columnId: number): void {
    try {
      const existingPrefs = this.getColumnPreferences(boardId);
      if (!existingPrefs) return;

      // Remove the specific column from preferences
      const updatedColors = { ...existingPrefs.columnColors };
      const updatedNames = { ...existingPrefs.columnNames };
      
      delete updatedColors[columnId];
      delete updatedNames[columnId];

      const updatedPrefs: ColumnPreferences = {
        ...existingPrefs,
        columnColors: updatedColors,
        columnNames: updatedNames,
        lastModified: new Date().toISOString()
      };

      this.setCookie(this.COLUMN_PREFS_KEY, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to clear column preferences:', error);
    }
  }
}

export default CookieStorage; 