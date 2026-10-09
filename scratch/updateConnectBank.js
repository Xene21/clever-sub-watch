const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src/pages/ConnectBank.tsx');
let content = fs.readFileSync(filePath, 'utf8');
if (!content.includes("import Connect from '@mono.co/connect.js'")) {
  content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport Connect from '@mono.co/connect.js';");
}
const monoLogic = "  const handleMonoSuccess = useCallback(async (code: string) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/mono/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error();
      toast.success('Mono bank account successfully connected!');
      fetchItems();
    } catch {
      toast.error('Failed to link Mono account.');
    } finally {
      setSyncing(false);
    }
  }, [fetchItems]);

  const openMonoWidget = useCallback(() => {
    const monoInstance = new Connect({
      key: import.meta.env.VITE_MONO_PUBLIC_KEY,
      onSuccess: ({ code }: any) => handleMonoSuccess(code),
      onClose: () => console.log('Mono widget closed'),
    });
    monoInstance.setup();
    monoInstance.open();
  }, [handleMonoSuccess]);
";
if (!content.includes('const handleMonoSuccess')) {
  content = content.replace('  return (', monoLogic + '  return (');
}
const buttonsRegex = /\{syncing \? \([\s\S]*?Initialising secure connection\.\.\.[\s\S]*?<\/Button>\s*\)\s*\}/;
const newButtons = {syncing ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Connecting your bank and scanning transactions...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {sessionToken && CONNECTOR_ID ? (
                    <QuilttAuthProvider token={sessionToken}>
                      <QuilttButton
                        connectorId={CONNECTOR_ID}
                        onExitSuccess={(metadata: any) => {
                          const connectionId = metadata?.connectionId;
                          const instName = metadata?.institution?.name ?? metadata?.connectorSession?.institution?.name ?? null;
                          handleQuilttSuccess(connectionId, { institution: { name: instName } });
                        }}
                        onExit={() => setError(null)}
                      >
                        <Button size="lg" className="gap-2" id="quiltt-connect-button">
                          <Landmark className="w-4 h-4" />
                          Connect US/UK Bank
                        </Button>
                      </QuilttButton>
                    </QuilttAuthProvider>
                  ) : (
                    <Button size="lg" disabled className="gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initialising Quiltt...
                    </Button>
                  )}
                  
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="gap-2 border border-white/10" 
                    onClick={openMonoWidget}
                    id="mono-connect-button"
                  >
                    <Globe className="w-4 h-4" />
                    Connect African Bank
                  </Button>
                </div>
              )};
content = content.replace(buttonsRegex, newButtons);
if(!content.includes('Globe')) {
  content = content.replace('Landmark, Zap', 'Landmark, Zap, Globe');
}
fs.writeFileSync(filePath, content);
