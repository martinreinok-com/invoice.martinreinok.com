import { CSSClasses } from '../data/types'

const colorDark = '#222'
const colorDark2 = '#666'
const colorGray = '#e3e3e3'
const colorWhite = '#fff'

const styles: CSSClasses = {
  dark: {
    color: colorDark,
  },

  white: {
    color: colorWhite,
  },

  'bg-dark': {
    backgroundColor: colorDark2,
  },

  'bg-gray': {
    backgroundColor: colorGray,
  },

  flex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },

  "flex-container": {
    display: 'flex-container',
    flexDirection: 'row',
  },

  "invoice-footer": {
    position: "absolute",
    bottom: "0px",
    left: "0px",
    right: "0px",
    marginLeft: "0px",
    marginRight: "0px",
    backgroundColor: colorGray,
  },

  'ml-35': {
    marginLeft: '35px',
  },

  'mr-35': {
    marginRight: '35px',
  },

  'w-auto': {
    flex: 1,
    paddingRight: '8px',
  },

  'ml-30': {
    flex: 1,
  },

  'w-100': {
    width: '100%',
  },

  'w-90': {
    width: '90%',
  },

  'w-80': {
    width: '80%',
  },

  'w-70': {
    width: '70%',
  },

  'w-60': {
    width: '60%',
  },

  'w-55': {
    width: '55%',
  },

  'w-50': {
    width: '50%',
  },

  'w-48': {
    width: '48%',
  },

  'w-45': {
    width: '45%',
  },

  'w-40': {
    width: '40%',
  },

  'w-35': {
    width: '35%',
  },

  'w-30': {
    width: '30%',
  },

  'w-25': {
    width: '25%',
  },

  'w-17': {
    width: '17%',
  },

  'w-18': {
    width: '18%',
  },

  'w-20': {
    width: '20%',
  },

  'w-15': {
    width: '15%',
  },

  row: {
    borderBottom: `1px solid ${colorGray}`,
  },

  "divider": {
    borderTop: `2px solid ${colorGray}`,
  },

  'mt-60': {
    marginTop: '30px',
  },

  'mt-40': {
    marginTop: '15px',
  },

  'mt-30': {
    marginTop: '10px',
  },

  'mt-20': {
    marginTop: '8px',
  },

  'mt-18': {
    marginTop: '18px',
  },

  'mt-15': {
    marginTop: '15px',
  },

  'mt-10': {
    marginTop: '10px',
  },

  'mt-5': {
    marginTop: '5px',
  },

  'mb-5': {
    marginBottom: '3px',
  },

  'mb-10': {
    marginBottom: '5px',
  },

  'p-4-8': {
    padding: '2px 6px',
  },

  'p-5': {
    padding: '3px',
  },

  'pb-10': {
    paddingBottom: '5px',
  },

  right: {
    textAlign: 'right',
  },

  center: {
    textAlign: 'center',
  },

  bold: {
    fontWeight: 'bold',
  },

  'fs-10': {
    fontSize: '10px',
  },

  'fs-15': {
    fontSize: '15px',
  },

  'fs-20': {
    fontSize: '20px',
  },

  'fs-30': {
    fontSize: '30px',
  },

  'fs-35': {
    fontSize: '35px',
  },

  'fs-38': {
    fontSize: '38px',
  },

  'fs-40': {
    fontSize: '40px',
  },

  'fs-45': {
    fontSize: '45px',
  },

  page: {
    fontFamily: 'Nunito',
    fontSize: '12px',
    color: '#555',
    paddingTop: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    paddingBottom: "15px"
  },

  span: {
    padding: '2px 8px 2px 0',
  },

  logo: {
    display: 'block',
  }
}

export default styles
