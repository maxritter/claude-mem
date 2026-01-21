import React from 'react';
import { Card, CardBody, CardTitle, Select, Input, Toggle } from '../../../components/ui';

interface AdvancedTabProps {
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
}

const logLevelOptions = [
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

export function AdvancedTab({ settings, onSettingChange }: AdvancedTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <CardTitle>Logging</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Configure logging verbosity
          </p>
          <Select
            label="Log Level"
            options={logLevelOptions}
            value={settings.CLAUDE_MEM_LOG_LEVEL || 'info'}
            onChange={(e) => onSettingChange('CLAUDE_MEM_LOG_LEVEL', e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Tool Filtering</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Skip processing for specific tools (comma-separated)
          </p>
          <Input
            label="Skip Tools"
            placeholder="Read, Write, Grep"
            value={settings.CLAUDE_MEM_SKIP_TOOLS || ''}
            onChange={(e) => onSettingChange('CLAUDE_MEM_SKIP_TOOLS', e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>File Exclusions</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Patterns to exclude from folder markdown generation
          </p>
          <Input
            label="Exclude Patterns"
            placeholder="node_modules, .git, dist"
            value={settings.CLAUDE_MEM_FOLDER_MD_EXCLUDE || 'node_modules,.git,dist'}
            onChange={(e) => onSettingChange('CLAUDE_MEM_FOLDER_MD_EXCLUDE', e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Privacy</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Control what data is stored
          </p>
          <div className="space-y-3">
            <Toggle
              label="Store User Prompts"
              checked={settings.CLAUDE_MEM_STORE_PROMPTS !== false}
              onChange={(e) => onSettingChange('CLAUDE_MEM_STORE_PROMPTS', e.target.checked)}
            />
            <Toggle
              label="Store Tool Results"
              checked={settings.CLAUDE_MEM_STORE_TOOL_RESULTS !== false}
              onChange={(e) => onSettingChange('CLAUDE_MEM_STORE_TOOL_RESULTS', e.target.checked)}
            />
            <Toggle
              label="Store File Contents"
              checked={settings.CLAUDE_MEM_STORE_FILE_CONTENTS !== false}
              onChange={(e) => onSettingChange('CLAUDE_MEM_STORE_FILE_CONTENTS', e.target.checked)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Compression</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Memory compression settings
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Content Length"
              type="number"
              value={settings.CLAUDE_MEM_MIN_CONTENT_LENGTH || '100'}
              onChange={(e) => onSettingChange('CLAUDE_MEM_MIN_CONTENT_LENGTH', e.target.value)}
            />
            <Input
              label="Max Content Length"
              type="number"
              value={settings.CLAUDE_MEM_MAX_CONTENT_LENGTH || '10000'}
              onChange={(e) => onSettingChange('CLAUDE_MEM_MAX_CONTENT_LENGTH', e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Experimental</CardTitle>
          <p className="text-sm text-base-content/60 mb-4">
            Experimental features (may be unstable)
          </p>
          <div className="space-y-3">
            <Toggle
              label="Enable Concept Extraction"
              checked={settings.CLAUDE_MEM_ENABLE_CONCEPTS === true}
              onChange={(e) => onSettingChange('CLAUDE_MEM_ENABLE_CONCEPTS', e.target.checked)}
            />
            <Toggle
              label="Enable Auto-Summarization"
              checked={settings.CLAUDE_MEM_AUTO_SUMMARIZE === true}
              onChange={(e) => onSettingChange('CLAUDE_MEM_AUTO_SUMMARIZE', e.target.checked)}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
