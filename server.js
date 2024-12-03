const express = require('express');
const soap = require('soap');
const cors = require('cors');  // Import the CORS package
const app = express();
const port = 1999;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000' // Ensure frontend URL is allowed
}));

// Define the SOAP service WSDL (Web Service Definition Language)
const service = {
    CalculatorService: {
        CalculatorServiceSoap: {
            multiply: function(args) {
                return {
                    multiplyResponse: { // This matches the expected response structure in your WSDL
                        result: args.a * args.b
                    }
                };
            }
        }
    }
};

const xml = `
<definitions xmlns:tns="http://www.examples.com/wsdl/HelloService.wsdl"
             xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
             xmlns:web="http://www.examples.com/wsdl/HelloService.wsdl"
             targetNamespace="http://www.examples.com/wsdl/HelloService.wsdl">
    <message name="multiplyRequest">
        <part name="a" type="xsd:int"/>
        <part name="b" type="xsd:int"/>
    </message>
    <message name="multiplyResponse">
        <part name="result" type="xsd:int"/>
    </message>
    <portType name="CalculatorService">
        <operation name="multiply">
            <input message="tns:multiplyRequest"/>
            <output message="tns:multiplyResponse"/>
        </operation>
    </portType>
    <binding name="CalculatorServiceSoap" type="tns:CalculatorService">
        <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="multiply">
            <soap:operation soapAction="multiply"/>
            <input>
                <soap:body use="encoded" namespace="http://www.examples.com/wsdl/HelloService.wsdl"/>
            </input>
            <output>
                <soap:body use="encoded" namespace="http://www.examples.com/wsdl/HelloService.wsdl"/>
            </output>
        </operation>
    </binding>
    <service name="CalculatorService">
        <port name="CalculatorServiceSoap" binding="tns:CalculatorServiceSoap">
            <soap:address location="http://localhost:${port}/ws"/>
        </port>
    </service>
</definitions>
`;

// Start the SOAP service
app.listen(port, () => {
    console.log(`SOAP service running at http://localhost:${port}/ws`);
});

// Serve the SOAP WSDL definition
app.get('/wsdl', (req, res) => {
    res.header('Content-Type', 'text/xml');
    res.send(xml);
});

// Define the SOAP service
soap.listen(app, '/ws', service, xml);
