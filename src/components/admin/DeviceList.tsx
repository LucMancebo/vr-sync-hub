import { Glasses, Monitor, Wifi, WifiOff } from 'lucide-react';
import { ConnectedDevice } from '@/types/video';

interface DeviceListProps {
  devices: ConnectedDevice[];
}

export const DeviceList = ({ devices }: DeviceListProps) => {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dispositivos Conectados</h3>
        <span className="text-sm text-muted-foreground">
          {devices.length} {devices.length === 1 ? 'dispositivo' : 'dispositivos'}
        </span>
      </div>

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
          {devices.map((device) => (
            <div key={device.id} className="device-card">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {device.type === 'vr' ? (
                  <Glasses className="w-5 h-5 text-primary" />
                ) : (
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{device.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {device.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`status-indicator ${device.status}`} />
                <span className="text-sm capitalize text-muted-foreground">
                  {device.status === 'connected' ? 'Conectado' : 
                   device.status === 'syncing' ? 'Sincronizando' : 'Desconectado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="w-4 h-4" />
          <span>Link do Player VR:</span>
          <code className="px-2 py-1 bg-secondary rounded text-primary">
            {window.location.origin}/vr
          </code>
        </div>
      </div>
    </div>
  );
};
