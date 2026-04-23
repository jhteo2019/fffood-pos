export interface Category { id: string; name: string; sub?: string; sortOrder: number; }
export interface ModifierOption { id: string; name: string; price: number; }
export interface ModifierGroup { id: string; name: string; isRequired: boolean; isMulti: boolean; options: ModifierOption[]; }
export interface MenuItem { id: string; name: string; categoryId: string; categoryName: string; price: number; stock: number; tags: string[]; isActive: boolean; modifiers: ModifierGroup[]; }
export interface StaffMember { id: string; name: string; role: string; initials: string; color: string; }
export interface CartModifier { id: string; name: string; price: number; }
export interface CartLine { lineId: string; itemId: string; itemName: string; modifiers: CartModifier[]; qty: number; note: string; unitPrice: number; lineTotal: number; }
export interface OrderLine { id: number; itemName: string; qty: number; unitPrice: number; lineTotal: number; note?: string; modifiers: string[]; }
export interface Order { id: number; orderNumber: string; staffName: string; orderType: string; tableNumber?: number; guests: number; subtotal: number; taxAmount: number; discount: number; total: number; status: string; paymentMethod?: string; changeDue?: number; createdAt: string; lines: OrderLine[]; }
export interface InventoryItem { id: string; name: string; categoryId: string; categoryName: string; price: number; stock: number; tags: string[]; }
export interface LoginResponse { staffId: string; name: string; role: string; initials: string; color: string; token: string; }
