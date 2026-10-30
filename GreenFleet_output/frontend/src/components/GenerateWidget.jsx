import React from 'react'

export function GenerateWidget({ height = '400px', widgetSpec }) {
  return (
    <div 
      style={{ height }} 
      className="w-full bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-auto border border-gray-800"
    >
      <div className="text-gray-400 border-b border-gray-800 pb-2 mb-2 font-bold">
        [Telemetry Widget Container]
      </div>
      <pre>{JSON.stringify(widgetSpec, null, 2)}</pre>
    </div>
  )
}