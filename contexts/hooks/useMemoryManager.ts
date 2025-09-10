
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { LongTermMemoryData } from '../../types/index.ts';

export const useMemoryManager = () => {
    const [longTermMemory, setLongTermMemory] = useLocalStorage<LongTermMemoryData>('long-term-memory', {});

    const clearMemory = () => {
        if (window.confirm('Are you sure you want to permanently delete the AI\'s long-term memory? This action cannot be undone.')) {
            setLongTermMemory({});
        }
    };

    return {
        longTermMemory,
        setLongTermMemory,
        clearMemory,
    };
};