import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Prospect } from '@/types';
import QuoteDetail from './QuoteDetail';
import QuoteFormWrapper from './QuoteFormWrapper';

export default function QuoteDetailView() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { quotes, prospects } = useCRM();

    const allQuotes = [...quotes, ...prospects.flatMap((p: Prospect) => (p.cotizaciones as any) || [])];
    const quote = allQuotes.find(q => q.id === id);

    if (searchParams.get('edit') === 'true') {
        return <QuoteFormWrapper />;
    }

    if (!quote) return <div className="p-6">Cotización no encontrada</div>;

    return (
        <QuoteDetail
            quote={quote as any}
            onClose={() => navigate('/crm/quotes')}
            onEdit={() => navigate(`/crm/quotes/${quote.id}?edit=true`)}
        />
    );
}
