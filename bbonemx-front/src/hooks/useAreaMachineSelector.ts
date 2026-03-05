import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import {
    GetSubAreasByAreaDocument,
    GetMachinesByAreaDocument,
} from '@/lib/graphql/generated/graphql';

export function useAreaMachineSelector() {
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedSubAreaId, setSelectedSubAreaId] = useState('');
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [subAreasLoaded, setSubAreasLoaded] = useState(false);

    const [fetchSubAreas, { data: subAreasData, loading: isLoadingSubAreas }] =
        useLazyQuery(GetSubAreasByAreaDocument, { fetchPolicy: 'cache-and-network' });

    const [fetchMachines, { data: machinesData, loading: isLoadingMachines }] =
        useLazyQuery(GetMachinesByAreaDocument, { fetchPolicy: 'cache-and-network' });

    const hasSubAreas = (subAreasData?.subAreasByArea?.length ?? 0) > 0;

    const handleAreaChange = useCallback((areaId: string) => {
        setSelectedAreaId(areaId);
        setSelectedSubAreaId('');
        setSelectedMachineId('');
        setSubAreasLoaded(false);

        if (areaId) {
            fetchSubAreas({ variables: { areaId } }).then(() => setSubAreasLoaded(true));
            fetchMachines({ variables: { areaId } });
        }
    }, [fetchSubAreas, fetchMachines]);

    const handleSubAreaChange = useCallback((subAreaId: string) => {
        setSelectedSubAreaId(subAreaId);
        setSelectedMachineId('');

        if (subAreaId && selectedAreaId) {
            fetchMachines({ variables: { areaId: selectedAreaId, subAreaId } });
        } else if (selectedAreaId) {
            fetchMachines({ variables: { areaId: selectedAreaId } });
        }
    }, [selectedAreaId, fetchMachines]);

    const handleMachineChange = useCallback((machineId: string) => {
        setSelectedMachineId(machineId);
    }, []);

    const reset = useCallback(() => {
        setSelectedAreaId('');
        setSelectedSubAreaId('');
        setSelectedMachineId('');
        setSubAreasLoaded(false);
    }, []);

    const initWith = useCallback((areaId: string, subAreaId?: string, machineId?: string) => {
        setSelectedAreaId(areaId);
        setSelectedSubAreaId(subAreaId || '');
        setSelectedMachineId(machineId || '');
        if (areaId) {
            fetchSubAreas({ variables: { areaId } }).then(() => setSubAreasLoaded(true));
            fetchMachines({ variables: { areaId, ...(subAreaId ? { subAreaId } : {}) } });
        }
    }, [fetchSubAreas, fetchMachines]);

    return {
        selectedAreaId,
        selectedSubAreaId,
        selectedMachineId,
        subAreasData,
        machinesData,
        isLoadingSubAreas,
        isLoadingMachines,
        hasSubAreas,
        subAreasLoaded,
        handleAreaChange,
        handleSubAreaChange,
        handleMachineChange,
        reset,
        initWith,
    };
}
