# TokenRedemption Component - ESG Integration

## Overview
The TokenRedemption component has been rewritten to integrate with the ESG evaluation API (`POST /evaluate`) while maintaining the existing token redemption functionality. The component now provides a comprehensive ESG evaluation and token redemption system.

## Key Features

### 1. ESG Evaluation Section
- **Input Fields**: Revenue (VND) and Emissions (tons CO2)
- **API Integration**: Calls `POST /evaluate` with JWT authentication
- **Real-time Validation**: Client-side validation for numeric inputs
- **Dynamic Results**: Shows ESG score and eligibility status
- **Token Eligibility**: Users with ESG score ≥80 are eligible for tokens

### 2. Token Redemption Section
- **Existing Functionality**: Maintains all original token redemption features
- **Balance Display**: Shows current GCT balance
- **Tier System**: 4-tier redemption system with different discount levels
- **Modal Results**: Success modal with transaction details

## API Integration

### ESG Evaluation Endpoint
```javascript
POST /evaluate
Headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
Body: {
  "revenue": number,
  "emissions": number
}
Response: {
  "result": "esgScore",
  "error": "errorMessage"
}
```

### Error Handling
- **400 Errors**: Missing required fields, invalid input
- **500 Errors**: Python model errors, server issues
- **Network Errors**: Connection timeouts, API unavailable
- **Validation Errors**: Client-side input validation

## Component Structure

### State Management
```javascript
// ESG Evaluation States
const [revenue, setRevenue] = useState('');
const [emissions, setEmissions] = useState('');
const [esgScore, setEsgScore] = useState(null);
const [esgLoading, setEsgLoading] = useState(false);
const [esgError, setEsgError] = useState('');
const [showEsgResult, setShowEsgResult] = useState(false);

// Token Redemption States (existing)
const [amount, setAmount] = useState('');
const [balance, setBalance] = useState(0);
const [loading, setLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
const [redemptionResult, setRedemptionResult] = useState(null);
```

### Key Functions

#### `handleEsgEvaluation(e)`
- Validates input (revenue > 0, emissions ≥ 0)
- Calls `/evaluate` API with JWT authentication
- Handles response and error states
- Updates UI with ESG score and eligibility status

#### `handleRedeem(e)` (existing)
- Validates token amount
- Calls `/redeem-token` API
- Shows success modal with transaction details

## UI Components

### ESG Evaluation Form
- **Revenue Input**: Number input with VND placeholder
- **Emissions Input**: Number input with tons CO2 placeholder
- **Submit Button**: Disabled during loading, shows spinner
- **Error Display**: Alert box for validation/API errors
- **Result Display**: Shows ESG score and eligibility status

### Token Redemption Form (existing)
- **Amount Input**: Number input with balance validation
- **Tier Display**: Visual cards showing redemption tiers
- **Submit Button**: Disabled during loading or invalid input
- **Success Modal**: Transaction details and benefits

## Styling & Responsiveness

### Bootstrap Classes Used
- `container`, `row`, `col-md-*`: Responsive grid system
- `card`, `card-header`, `card-body`: Card components
- `form-control`, `form-label`, `form-text`: Form styling
- `btn`, `btn-primary`, `btn-success`: Button styling
- `alert`, `alert-success`, `alert-danger`: Alert components
- `badge`, `bg-success`, `bg-warning`: Status indicators
- `spinner-border`: Loading indicators

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: Two-column layout for form inputs
- **Desktop**: Full-width layout with side-by-side sections

## Internationalization

### Translation Keys Added
```javascript
// ESG Evaluation Keys
"esgEvaluation": "ESG Evaluation",
"esgEvaluationSubtitle": "Evaluate your company's ESG score to earn GreenCredit tokens",
"revenue": "Revenue",
"emissions": "Emissions",
"esgScore": "ESG Score",
"eligibleForTokens": "Eligible for Tokens!",
"improveEsg": "Improve ESG Score",
// ... and more
```

### Supported Languages
- **English**: Complete translation
- **Vietnamese**: Complete translation with proper Vietnamese terminology

## Testing Instructions

### 1. Start the Application
```bash
cd frontend
npm start
```

### 2. Test ESG Evaluation
1. Navigate to Dashboard → Token Redemption tab
2. Enter valid revenue (e.g., 1000000000 VND)
3. Enter valid emissions (e.g., 500 tons CO2)
4. Click "Evaluate ESG Score"
5. Verify API call to `/evaluate`
6. Check ESG score display and eligibility status

### 3. Test Token Redemption
1. Ensure user has token balance
2. Enter valid token amount
3. Click "Redeem Tokens"
4. Verify API call to `/redeem-token`
5. Check success modal display

### 4. Test Error Handling
1. Submit empty ESG form → Validation error
2. Submit invalid numbers → Input validation error
3. Test API errors → Error message display
4. Test network issues → Connection error handling

## Expected API Responses

### Successful ESG Evaluation
```json
{
  "result": "85.5",
  "error": ""
}
```

### ESG Evaluation Error
```json
{
  "result": "",
  "error": "Missing required fields: revenue and emissions"
}
```

### Successful Token Redemption
```json
{
  "discount": "15% interest reduction",
  "newBalance": 450000000,
  "txHash": "0x123...",
  "message": "Tokens redeemed successfully!"
}
```

## Dependencies

### Required Packages
- `react`: ^19.1.1
- `axios`: ^1.11.0
- `react-toastify`: ^9.1.3
- `react-i18next`: Latest
- `bootstrap`: ^5.3.8

### No Additional Dependencies
The component uses existing dependencies and doesn't require any new packages.

## Production Considerations

### Environment Variables
```bash
REACT_APP_API_URL=http://localhost:3001  # Development
REACT_APP_API_URL=https://api.greencredit.ai  # Production
```

### Security
- JWT tokens stored in localStorage
- API calls include Authorization headers
- Input validation on both client and server
- Error messages don't expose sensitive information

### Performance
- Lazy loading of modal components
- Efficient state management
- Minimal re-renders with proper dependency arrays
- Optimized API calls with proper error handling

## Troubleshooting

### Common Issues
1. **API Connection**: Check if backend server is running
2. **Authentication**: Verify JWT token is valid
3. **CORS**: Ensure backend allows frontend origin
4. **Python Model**: Check if ai_model.py is accessible
5. **Validation**: Ensure numeric inputs are properly formatted

### Debug Mode
Enable console logging by setting:
```javascript
const DEBUG = true; // Add to component for detailed logging
```

## Future Enhancements

### Potential Improvements
1. **Real-time Validation**: Validate inputs as user types
2. **ESG History**: Store and display previous evaluations
3. **Advanced Analytics**: Chart ESG score trends
4. **Batch Evaluation**: Evaluate multiple companies
5. **Export Features**: Download evaluation results
6. **Integration**: Connect with external ESG data sources

### Scalability Considerations
1. **Caching**: Cache ESG evaluation results
2. **Rate Limiting**: Implement API rate limiting
3. **Batch Processing**: Handle multiple evaluations
4. **Real-time Updates**: WebSocket integration for live updates
