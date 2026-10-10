/**
 * GANT — 2.5D Bee Mascot Visual Identity & State Mapping Tests
 * Verifies that all 4 official mascot state assets exist, have valid WebP headers,
 * and that mood-to-asset mapping strictly preserves character consistency.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getMascotAsset, MascotMood } from '../components/assistant/GanttBeeAssistant';

describe('GANT Bee 2.5D Mascot Visual Identity', () => {
  const publicDir = path.resolve(process.cwd(), 'public/assets/gant-bee');

  const requiredStates = [
    { state: 'idle', file: 'gant-bee-idle.webp' },
    { state: 'friendly', file: 'gant-bee-friendly.webp' },
    { state: 'guide', file: 'gant-bee-guide.webp' },
    { state: 'success', file: 'gant-bee-success.webp' },
  ];

  it('1. Confirms all four required 2.5D mascot assets exist on disk', () => {
    requiredStates.forEach(({ file }) => {
      const filePath = path.join(publicDir, file);
      expect(fs.existsSync(filePath), `Asset ${file} should exist at ${filePath}`).toBe(true);

      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(10000); // At least 10KB
    });
  });

  it('2. Validates that mascot assets are valid WebP image binaries', () => {
    requiredStates.forEach(({ file }) => {
      const filePath = path.join(publicDir, file);
      const buffer = fs.readFileSync(filePath);

      // WebP files start with 'RIFF' at 0..3 and 'WEBP' at 8..11
      const riffHeader = buffer.toString('ascii', 0, 4);
      const webpHeader = buffer.toString('ascii', 8, 12);

      expect(riffHeader).toBe('RIFF');
      expect(webpHeader).toBe('WEBP');
    });
  });

  it('3. Verifies mood-to-asset mapping routes correctly to the four official states', () => {
    // Idle state
    expect(getMascotAsset('idle')).toBe('/assets/gant-bee/gant-bee-idle.webp');
    expect(getMascotAsset('observing')).toBe('/assets/gant-bee/gant-bee-idle.webp');

    // Friendly state
    expect(getMascotAsset('friendly')).toBe('/assets/gant-bee/gant-bee-friendly.webp');
    expect(getMascotAsset('waiting_for_user')).toBe('/assets/gant-bee/gant-bee-friendly.webp');
    expect(getMascotAsset('detecting')).toBe('/assets/gant-bee/gant-bee-friendly.webp');

    // Guide state
    expect(getMascotAsset('guiding')).toBe('/assets/gant-bee/gant-bee-guide.webp');
    expect(getMascotAsset('pointing')).toBe('/assets/gant-bee/gant-bee-guide.webp');
    expect(getMascotAsset('correction')).toBe('/assets/gant-bee/gant-bee-guide.webp');

    // Success state
    expect(getMascotAsset('success')).toBe('/assets/gant-bee/gant-bee-success.webp');

    // Default fallback
    expect(getMascotAsset('transition' as MascotMood)).toBe('/assets/gant-bee/gant-bee-idle.webp');
  });

  it('4. Confirms that all resolved asset paths correspond to existing files in public folder', () => {
    const testMoods: MascotMood[] = [
      'idle',
      'friendly',
      'observing',
      'guiding',
      'pointing',
      'waiting_for_user',
      'detecting',
      'success',
      'correction',
      'transition',
    ];

    testMoods.forEach((mood) => {
      const assetUrl = getMascotAsset(mood);
      expect(assetUrl.startsWith('/assets/gant-bee/')).toBe(true);

      const relativeFile = assetUrl.replace('/assets/gant-bee/', '');
      const diskPath = path.join(publicDir, relativeFile);
      expect(fs.existsSync(diskPath), `Mapped asset ${diskPath} for mood ${mood} must exist`).toBe(true);
    });
  });

  it('5. Validates head-crop asset for small icons', () => {
    const headPath = path.join(publicDir, 'gant-bee-head.webp');
    expect(fs.existsSync(headPath), 'gant-bee-head.webp should exist').toBe(true);

    const buffer = fs.readFileSync(headPath);
    expect(buffer.toString('ascii', 0, 4)).toBe('RIFF');
    expect(buffer.toString('ascii', 8, 12)).toBe('WEBP');
  });

  it('6. Ensures no legacy JPG mascot imports remain in source code', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
          entry.name !== 'beeMascotVisualIdentity.test.ts'
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content.includes('.jpg'), `File ${entry.name} should not contain .jpg references`).toBe(false);
        }
      }
    };
    checkDir(srcDir);
  });
});
