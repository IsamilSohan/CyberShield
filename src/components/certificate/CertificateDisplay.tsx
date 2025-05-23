import type { Certificate } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Award } from 'lucide-react';
import Image from 'next/image';

interface CertificateDisplayProps {
  certificate: Certificate;
}

export function CertificateDisplay({ certificate }: CertificateDisplayProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl overflow-hidden border-4 border-primary/20">
      <CardHeader className="bg-primary/5 p-8 text-center">
        <Award className="w-16 h-16 text-primary mx-auto mb-4" />
        <CardTitle className="text-3xl font-bold text-primary">Certificate of Completion</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">This certifies that</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6 text-center">
        <p className="text-4xl font-semibold text-accent">{certificate.userName}</p>
        <p className="text-lg text-foreground">has successfully completed the course</p>
        <p className="text-2xl font-medium text-primary">{certificate.courseName}</p>
        <p className="text-sm text-muted-foreground">
          Issued on: {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        {certificate.certificateUrl && (
           <div className="my-6">
            <Image 
              src={certificate.certificateUrl} 
              alt={`Certificate for ${certificate.courseName}`} 
              width={800} 
              height={600} 
              className="rounded-md border shadow-sm mx-auto"
              data-ai-hint="certificate award" 
            />
          </div>
        )}

        <div className="border-t pt-6 mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="default" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share Certificate
          </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-8">
          Certificate ID: {certificate.id}
        </p>
      </CardContent>
    </Card>
  );
}
