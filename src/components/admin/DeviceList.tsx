import { Glasses, Monitor, Wifi, WifiOff, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, BatteryWarning, AlertTriangle, X } from 'lucide-react';
import { ConnectedDevice } from '@/types/video';

interface DeviceListProps {
  devices: ConnectedDevice[];
  lowBatteryWarning?: string | null;
  onDismissWarning?: () => void;
}

export const DeviceList = ({ devices, lowBatteryWarning, onDismissWarning }: DeviceListProps) => {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dispositivos Conectados</h3>
        <span className="text-sm text-muted-foreground">
          {devices.length} {devices.length === 1 ? 'dispositivo' : 'dispositivos'}
        </span>
      </div>

      {/* Low Battery Warning Alert */}
      {lowBatteryWarning && (
        <div className="mb-4 p-3 rounded-lg bg-warning/20 border border-warning/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-warning">{lowBatteryWarning}</span>
          </div>
          {onDismissWarning && (
            <button 
              onClick={onDismissWarning}
              className="p-1 rounded hover:bg-warning/20 transition-colors"
            >
              <X className="w-4 h-4 text-warning" />
            </button>
          )}
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum dispositivo conectado</p>
          <p className="text-sm mt-1">
            Abra o link <code className="text-primary">/vr</code> em um dispositivo VR
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const getBatteryIcon = () => {
              if (device.batteryLevel === undefined) return null;
              if (device.batteryCharging) return <BatteryCharging className="w-4 h-4 text-success" />;
              if (device.batteryLevel <= 15) return <BatteryWarning className="w-4 h-4 text-destructive animate-pulse" />;
              if (device.batteryLevel <= 40) return <BatteryLow className="w-4 h-4 text-warning" />;
              if (device.batteryLevel <= 60) return <BatteryMedium className="w-4 h-4 text-muted-foreground" />;
              return <BatteryFull className="w-4 h-4 text-success" />;
            };

            const getBatteryColor = () => {
              if (device.batteryLevel === undefined) return 'text-foreground';
              if (device.batteryLevel <= 15) return 'text-destructive';
              if (device.batteryLevel <= 40) return 'text-warning';
              return 'text-foreground';
            };

            return (
              <div key={device.id} className="device-card">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  {device.type === 'vr' ? (
                    <Glasses className="w-5 h-5 text-primary" />
                  ) : (
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{device.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {device.id}
                  </p>
                </div>

                {/* Battery indicator */}
                {device.type === 'vr' && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                    device.batteryLevel !== undefined && device.batteryLevel <= 40 
                      ? 'bg-warning/20' 
                      : 'bg-secondary/50'
                  }`}>
                    {device.batteryLevel !== undefined ? (
                      <>
                        {getBatteryIcon()}
                        <span className={`text-sm font-medium ${getBatteryColor()}`}>
                          {Math.round(device.batteryLevel)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`status-indicator ${device.status}`} />
                  <span className="text-sm capitalize text-muted-foreground hidden sm:inline">
                    {device.status === 'connected' ? 'Conectado' : 
                     device.status === 'syncing' ? 'Sincronizando' : 'Desconectado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="w-4 h-4" />
          <span>Link do Player VR:</span>
          <code className="px-2 py-1 bg-secondary rounded text-primary text-xs">
            {window.location.origin}/vr
          </code>
        </div>
      </div>
    </div>
  );
};
