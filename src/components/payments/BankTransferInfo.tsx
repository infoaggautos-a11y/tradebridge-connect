import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BANK_DETAILS = {
  bankName: 'Zenith Bank',
  accountName: 'Dauno Integrated Ltd',
  accountNumber: '1225428589',
} as const;

export default function BankTransferInfo() {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  return (
    <Card className="border-gold/30 bg-gold/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-gold" />
          Bank Transfer Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <span className="text-muted-foreground">Bank:</span>
              <span className="ml-2 font-medium">{BANK_DETAILS.bankName}</span>
            </div>
            <button onClick={() => copyToClipboard(BANK_DETAILS.bankName, 'Bank name')}>
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <span className="text-muted-foreground">Account Name:</span>
              <span className="ml-2 font-medium">{BANK_DETAILS.accountName}</span>
            </div>
            <button onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'Account name')}>
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <span className="text-muted-foreground">Account Number:</span>
              <span className="ml-2 font-mono font-bold text-lg text-gold-dark">{BANK_DETAILS.accountNumber}</span>
            </div>
            <button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'Account number')}>
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Use your email as the transfer reference so we can identify your payment. After transfer,
          submit the payment details below for verification.
        </p>
      </CardContent>
    </Card>
  );
}
