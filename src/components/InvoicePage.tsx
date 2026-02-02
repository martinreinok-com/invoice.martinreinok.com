import React, { FC, useState, useEffect, useRef } from 'react'
import { Invoice, ProductLine } from '../data/types'
import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from './EditableInput'
//import EditableSelect from './EditableSelect'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
import EditableFileImage from './EditableFileImage'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import format from 'date-fns/format'
import AddUIButton from "./AddUIButton"
import getConfirmation  from './ResetInvoice'
import downloadDataAsJson  from './DownloadTemplate'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 },
  ],
})

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
}

function downloadInvoiceData(currentInvoice: Invoice) {
  downloadDataAsJson(currentInvoice, currentInvoice.title);
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [saleTax, setSaleTax] = useState<number>()
  const inputFile = useRef<HTMLInputElement | null>(null);

  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 14)
  }

  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== 'productLines') {
      const newInvoice = { ...invoice }

      if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice)
    }
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((productLine, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity)
    const rateNumber = parseFloat(rate)
    const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

    return amount.toFixed(2)
  }

  const uploadInvoiceData = () => {
    // `current` points to the mounted file input element
    inputFile.current?.click();
    };
  
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]; // Use optional chaining to handle null
    
      if (selectedFile) {
        // Rest of the code remains the same
        const reader = new FileReader();
    
        // Define a callback function to handle the file reading
        reader.onload = (event) => {
          if (event.target) {
            const fileContents = event.target.result; // This is the file content
            try {
              const parsedData : Invoice = JSON.parse(fileContents as string);
              console.log('Parsed Data:', parsedData);
              setInvoice(parsedData);
            } catch (error) {
              console.error('Error parsing file:', error);
            }
          }
        };
    
        // Read the file as text or any other appropriate method
        reader.readAsText(selectedFile);
      }
    };

  useEffect(() => {
    let subTotal = 0

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity)
      const rateNumber = parseFloat(productLine.rate)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

      subTotal += amount
    })

    setSubTotal(subTotal)
  }, [invoice.productLines])

  useEffect(() => {
    const match = invoice.taxLabel.match(/(\d+)%/)
    const taxRate = match ? parseFloat(match[1]) : 0
    const saleTax = subTotal ? (subTotal * taxRate) / 100 : 0

    setSaleTax(saleTax)
  }, [subTotal, invoice.taxLabel])

  useEffect(() => {
    if (onChange) {
      onChange(invoice)
    }
  }, [onChange, invoice])


  return (
    <>
    <AddUIButton 
      buttonClass={"button-reset-invoice"} 
      buttonName="Reset Invoice"
      hoverTitle={"Reset to Default"}
      onButtonClick={() => getConfirmation()}></AddUIButton>
    <AddUIButton 
      buttonClass={"button-save-invoice"} 
      buttonName="Save Invoice"
      hoverTitle={"Save Invoice to file"}
      onButtonClick={() => downloadInvoiceData(invoice)}></AddUIButton>
    <input type='file' id='file' accept='.json' ref={inputFile} onChange={handleFileInputChange} style={{display: 'none'}}/>
    <AddUIButton 
      buttonClass={"button-load-invoice"} 
      buttonName="Load Invoice"
      hoverTitle={"Load invoice from file"}
      onButtonClick={uploadInvoiceData}></AddUIButton>

    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {!pdfMode && <Download data={invoice} />}
        
        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableFileImage
              className="logo"
              placeholder="Firma logo"
              value={invoice.logo}
              width={invoice.logoWidth}
              pdfMode={pdfMode}
              onChangeImage={(value) => handleChange('logo', value)}
              onChangeWidth={(value) => handleChange('logoWidth', value)}
            />
            <EditableInput
              className="fs-20 bold"
              placeholder="Firma nimi"
              value={invoice.companyName}
              onChange={(value) => handleChange('companyName', value)}
              pdfMode={pdfMode}
            />
            <EditableTextarea
              placeholder="Aadress, ZIP Maakond Linn"
              value={invoice.name}
              onChange={(value) => handleChange('name', value)}
              pdfMode={pdfMode}
              rows={1}
            />
            <EditableInput
              placeholder="Registrikood"
              value={invoice.companyAddress}
              onChange={(value) => handleChange('companyAddress', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="VAT"
              value={invoice.companyAddress2}
              onChange={(value) => handleChange('companyAddress2', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Lisainfo (vajdusel)"
              value={invoice.companyCountry}
              onChange={(value) => handleChange('companyCountry', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-50" pdfMode={pdfMode}>
            <EditableInput
              className="fs-45 right bold"
              placeholder="Arve"
              value={invoice.title}
              onChange={(value) => handleChange('title', value)}
              pdfMode={pdfMode}
              autoChangeSize={true}
            />
          </View>
        </View>

        <View className="flex mt-40" pdfMode={pdfMode}>
          <View className="w-60" pdfMode={pdfMode}>
            <EditableInput
              className="bold dark mb-5"
              value={invoice.billTo}
              onChange={(value) => handleChange('billTo', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Kliendi nimi"
              value={invoice.clientName}
              onChange={(value) => handleChange('clientName', value)}
              pdfMode={pdfMode}
            />
            <EditableTextarea
              placeholder="Kliendi aadress"
              value={invoice.clientAddress}
              onChange={(value) => handleChange('clientAddress', value)}
              pdfMode={pdfMode}
              rows={1}
            />
            <EditableInput
              placeholder="ZIP Maakond Vald"
              value={invoice.clientAddress2}
              onChange={(value) => handleChange('clientAddress2', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Registrikood"
              value={invoice.clientCountry}
              onChange={(value) => handleChange('clientCountry', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-40" pdfMode={pdfMode}>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceTitleLabel}
                  onChange={(value) => handleChange('invoiceTitleLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableInput
                  placeholder="Arve number"
                  value={invoice.invoiceTitle}
                  onChange={(value) => handleChange('invoiceTitle', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDateLabel}
                  onChange={(value) => handleChange('invoiceDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDate, dateFormat)}
                  selected={invoiceDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex mb-5" pdfMode={pdfMode}>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.invoiceDueDateLabel}
                  onChange={(value) => handleChange('invoiceDueDateLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50" pdfMode={pdfMode}>
                <EditableCalendarInput
                  value={format(invoiceDueDate, dateFormat)}
                  selected={invoiceDueDate}
                  onChange={(date) =>
                    handleChange(
                      'invoiceDueDate',
                      date && !Array.isArray(date) ? format(date, dateFormat) : ''
                    )
                  }
                  pdfMode={pdfMode}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-30 bg-dark flex" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange('productLineQuantity', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) => handleChange('productLineQuantityRate', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) => handleChange('productLineQuantityAmount', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              <View className="w-48 p-4-8 pb-0" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={1}
                  placeholder="Toote/Teenuse nimi/kirjeldus"
                  value={productLine.description}
                  onChange={(value) => handleProductLineChange(i, 'description', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-0" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-0" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) => handleProductLineChange(i, 'rate', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-0" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          )
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Lisa rida
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-60 p-5" pdfMode={pdfMode}>
                <EditableInput
                  placeholder='Summa KM-ta'
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange('subTotalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  placeholder='KM (20%)'
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange('taxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {saleTax?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  placeholder='Arve kokku'
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {(typeof subTotal !== 'undefined' && typeof saleTax !== 'undefined'
                    ? subTotal + saleTax
                    : 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            placeholder='Lisainfo pealkiri (vajadusel)'
            value={invoice.notesLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100 fake-mb-100"
            rows={2}
            placeholder='Lisainfo (vajadusel)'
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
        </View>
        

        <View className="flex-container mt-30 invoice-footer" pdfMode={pdfMode}>
          <View className="w-15 ml-35 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <EditableInput
                      placeholder="Panga nimi"
                      value={invoice.bank1}
                      onChange={(value) => handleChange('bank1', value)}
                      pdfMode={pdfMode}
              />
            </View>
            <EditableInput
                    placeholder="Panga nimi"
                    value={invoice.bank2}
                    onChange={(value) => handleChange('bank2', value)}
                    pdfMode={pdfMode}
            />
          </View>
          <View className="w-30 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <EditableInput
                placeholder="IBAN"
                value={invoice.bank1IBAN}
                onChange={(value) => handleChange('bank1IBAN', value)}
                pdfMode={pdfMode}
              />
            </View>
          <EditableInput
              placeholder="IBAN"
              value={invoice.bank2IBAN}
              onChange={(value) => handleChange('bank2IBAN', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-15 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <EditableInput
                placeholder="(SWIFT)"
                value={invoice.bank1SWIFT}
                onChange={(value) => handleChange('bank1SWIFT', value)}
                pdfMode={pdfMode}
              />
            </View>
            <EditableInput
                placeholder="(SWIFT)"
                value={invoice.bank2SWIFT}
                onChange={(value) => handleChange('bank2SWIFT', value)}
                pdfMode={pdfMode}
              />
          </View>
          <View className="w-30  mr-35 mt-5" pdfMode={pdfMode}>
            <EditableTextarea
              className="w-100 center mb-10"
              rows={4}
              placeholder="Firma lisainfo, kontakt, epost, tel, www (õigeks formaadiks 4 rida teksti või vastavalt tühikuid)"
              value={invoice.firmaLisainfo}
              onChange={(value) => handleChange('firmaLisainfo', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>
        
      </Page>
    </Document>
    </>
  )
}

export default InvoicePage
