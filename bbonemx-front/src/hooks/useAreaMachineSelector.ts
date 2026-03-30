import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import {
    GetSubAreasByAreaDocument,
    GetMachinesByAreaDocument,
} from '@/lib/graphql/generated/graphql';
import { deriveAreaHasMachines } from '@/lib/logic/area-machine-logic';

export function useAreaMachineSelector() {
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedSubAreaId, setSelectedSubAreaId] = useState('');
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [subAreasLoaded, setSubAreasLoaded] = useState(false);
    // Tracks whether the AREA (not a sub-area filtered view) has machines.
    // Set once on handleAreaChange and never mutated by sub-area changes.
    const [areaHasMachines, setAreaHasMachines] = useState(false);

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
        setAreaHasMachines(false);

        if (areaId) {
            fetchSubAreas({ variables: { areaId } }).then(() => setSubAreasLoaded(true));
            fetchMachines({ variables: { areaId } }).then((result) => {
                const count = result.data?.machinesByArea?.length ?? 0;
                setAreaHasMachines(deriveAreaHasMachines(count));
            });
        }
    }, [fetchSubAreas, fetchMachines]);

    const handleSubAreaChange = useCallback((subAreaId: string) => {
        setSelectedSubAreaId(subAreaId);
        setSelectedMachineId('');

        // Fetch sub-area filtered machines for display in the machine selector,
        // but do NOT update areaHasMachines — it must remain based on area-level count.
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
        setAreaHasMachines(false);
    }, []);

    const initWith = useCallback((areaId: string, subAreaId?: string, machineId?: string) => {
        setSelectedAreaId(areaId);
        setSelectedSubAreaId(subAreaId || '');
        setSelectedMachineId(machineId || '');
        if (areaId) {
            fetchSubAreas({ variables: { areaId } }).then(() => setSubAreasLoaded(true));
            // Fetch area-level machines first to set areaHasMachines
            fetchMachines({ variables: { areaId } }).then((result) => {
                const count = result.data?.machinesByArea?.length ?? 0;
                setAreaHasMachines(deriveAreaHasMachines(count));
                // Then re-fetch with sub-area filter for display if sub-area is set
                if (subAreaId) {
                    fetchMachines({ variables: { areaId, subAreaId } });
                }
            });
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
        areaHasMachines,
        handleAreaChange,
        handleSubAreaChange,
        handleMachineChange,
        reset,
        initWith,
    };
}
