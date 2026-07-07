'use client'
import {useState, use, useEffect} from "react";
import {toast} from "sonner";
import { api } from "~/trpc/react";
import {Button} from "~/components/ui/button";
import {ChevronLeft} from 'lucide-react'
import {Input} from "~/components/ui/input";
import { useRouter } from "next/navigation";
export default function ServiceEdit({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}){
    const {serviceId} = use(params);
    const utils = api.useUtils()
    const {data:oldService, isLoading: loading} = api.services.getById.useQuery({
        serviceId: parseInt(serviceId)});
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        estimatedTime: 0,
        priority: 0,
    });

    useEffect(() => {
        if (oldService) {
            setFormData({
                name: oldService.name,
                description: oldService.description || "",
                estimatedTime: oldService.estimatedTime,
                priority: oldService.priority,
            });
        }
    }, [oldService]);

  const editService = api.services.edit.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      utils.services.getById.invalidate();
    },
    onError: (error:any) => {
      toast.error("Failed to update service",{description: error});
    },
  });


  return(
    <div className="flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
            <Button onClick={()=>router.back()} variant='ghost'>
                <ChevronLeft />
            </Button>
             <div>
                <h1>Editing Service</h1>
                <p className="text-muted-foreground">
                    You are currently editing service {oldService?.name}
                </p>
             </div>
             </div>
        </div>

        <div className="flex mt-4 flex-col h-full justify-center px-8 gap-4 ">
            <label className="text-sm text-muted-foreground">Service Name</label>
            <Input
                type="text"
                placeholder="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <label className="text-sm text-muted-foreground">Service Description</label>
            <textarea
            rows={4}
            
                className="w-full p-2 border bg-muted rounded-lg"
                placeholder="Service Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
           
           <label className="text-sm text-muted-foreground">Estimated Time (in minutes)</label>
                <Input
                    type="number"
                    placeholder="Estimated Time"
                    className="w-full"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                />
         
              <label className="text-sm text-muted-foreground">Priority (in days)</label>
                <Input
                    type="number"
                    placeholder="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
         
         <div className="flex justify-end mt-4">
            <Button variant="default" 
            className=" w-40 "
            onClick={() => editService.mutate({
                id: parseInt(serviceId),
                name: formData.name,
                description: formData.description,
                estimatedTime: formData.estimatedTime,
                priority: formData.priority,
            })}>
                Save Changes
            </Button>
            </div>
        </div>
    </div>
  )
}
