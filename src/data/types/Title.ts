export type Title = {
    name: string,
    url: string,
    promotion: string,
    isActive?: boolean,
    activeFrom?: string,
    activeTo?: string,
    reigns: {
        champion: string,
        heldFrom?: Date,
        heldTo?: Date
    }[]
}