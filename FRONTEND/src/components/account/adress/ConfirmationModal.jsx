import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function EditAddressModal({ isOpen, onClose, onSave, address }) {
  const [editedAddress, setEditedAddress] = useState(address || {
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  })

  useEffect(() => {
    if (address) {
      setEditedAddress(address)
    }
  }, [address])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onSave(editedAddress)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {['street', 'city', 'state', 'country', 'pincode'].map((field) => (
            <div key={field} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field} className="text-right capitalize">
                {field}
              </Label>
              <Input
                id={field}
                name={field}
                value={editedAddress?.[field] || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

