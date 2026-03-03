import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCRM } from '@/context/CRMContext';
import { Prospect } from '@/types';
import QuoteForm from './QuoteForm';
import QuoteList from './QuoteList';

export default function QuoteFormWrapper() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams<{ id: string }>();
    const { quotes, prospects } = useCRM();

    const allQuotes = [...quotes, ...prospects.flatMap((p: Prospect) => (p.cotizaciones as any) || [])];
    const editingQuote = id && searchParams.get('edit') === 'true'
        ? allQuotes.find(q => q.id === id)
        : undefined;

    const initialProspectId = searchParams.get('prospectId') || undefined;

    return (
        <>
            <QuoteList />
            <QuoteForm
                onClose={() => navigate('/crm/quotes')}
                editingQuote={editingQuote as any}
                initialProspectId={initialProspectId}
            />
        </>
    );
}
