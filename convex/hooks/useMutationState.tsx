import { useMutation } from "convex/react";
import { useState } from "react";

export const useMutationState = <T extends Parameters<typeof useMutation>[0]>(mutationToRun: T) => {
    const [pending, setPending] = useState(false);
    const mutationFn = useMutation(mutationToRun)

    const mutate = (payload: Parameters<typeof mutationFn>[0]) => {
        setPending(true);

        return mutationFn(payload).then(res =>{return res}).catch(error => {throw error}).finally(() => setPending(false));
    };

    return {mutate,pending};
};
