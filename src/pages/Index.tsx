import { Link } from 'react-router-dom';
import { Settings, Glasses, Play, Wifi, Users, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-button">
            <Play className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">VR Sync Hub</h1>
            <p className="text-xs text-muted-foreground">Central de Sincronização VR</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Sincronize vídeos em
            <span className="gradient-text block">dispositivos VR</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Controle e reproduza vídeos em tempo real em múltiplos óculos de realidade virtual. 
            Perfeito para experiências imersivas sincronizadas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/admin">
              <Button size="lg" className="glow-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg gap-3">
                <Settings className="w-5 h-5" />
                Painel Admin
              </Button>
            </Link>
            <Link to="/vr">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg gap-3 border-primary/50 hover:bg-primary/10">
                <Glasses className="w-5 h-5" />
                Player VR
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel p-8 text-center group hover:border-primary/50 transition-all">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wifi className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sincronização LAN</h3>
            <p className="text-muted-foreground text-sm">
              Conexão otimizada para redes locais com latência mínima
            </p>
          </div>

          <div className="glass-panel p-8 text-center group hover:border-primary/50 transition-all">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Múltiplos Dispositivos</h3>
            <p className="text-muted-foreground text-sm">
              Suporte para vários óculos VR conectados simultaneamente
            </p>
          </div>

          <div className="glass-panel p-8 text-center group hover:border-primary/50 transition-all">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tempo Real</h3>
            <p className="text-muted-foreground text-sm">
              Controle de reprodução com sincronização instantânea
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass-panel p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Para Administradores</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Faça upload de vídeos, gerencie a biblioteca e controle a reprodução em todos os dispositivos.
                </p>
                <code className="text-xs bg-secondary px-2 py-1 rounded text-primary">
                  {window.location.origin}/admin
                </code>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Glasses className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Para Óculos VR</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesse o player imersivo otimizado para dispositivos de realidade virtual.
                </p>
                <code className="text-xs bg-secondary px-2 py-1 rounded text-primary">
                  {window.location.origin}/vr
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        <p>VR Sync Hub • Central de Sincronização de Vídeos VR</p>
      </footer>
    </div>
  );
};

export default Index;
