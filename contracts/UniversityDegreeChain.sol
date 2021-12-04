pragma solidity ^0.5.0;

/// @title SMART CONTRACT BASED D-APP FOR STORING AND VERIFYING DEGREE INFORMATION
/// @author Aman Kumar (213050084), Abhishek Kumar (213050076), Ranodeep Saha (213050080)
/// @notice This contract is a simulation of how we can use blockchain as service for 3 types of end users University, Recruiting Company, Student for storing and verifying degree information of a student.

contract UniversityDegreeChain{
	///@notice Director, CSE_Hod, MECH_Hod, CIVIL_Hod, EE_Hod are the public address datatype variable representing account address of Director and HODs
	address public Director;
	address public CSE_Hod;
	address public MECH_Hod;
	address public CIVIL_Hod;
	address public EE_Hod;
	
	///@notice The Blockchain account address who will deploy this smart contract is assigned as a Director's account address by this constructor call.
	constructor() public {
	        Director = msg.sender;
      	}
      	
	///@notice This is the structure representig a "Student" containing fields - account address, Enroll No, Roll_no, Student's name, Department, program, date of joining, verified by HOD, verified by Director.
	struct Student {
        	address account; // blockchain address
        	uint Enroll_no;
        	string Roll_no; //student roll no
        	string name; //student name
        	uint depart; // 1 = CSE, 2 = MECH, 3= CIVIL, 4= EE
        	uint program; // 1 = BTECH, 2 = MTECH
        	string doj; //Date of Joining
        	bool HODVerified; //Flag status for Verification by HOD
        	bool DirectorVerified;	//Flag status for Verification by Director
        	
    	}
    	
	///@notice This is the structure representig a "SemesterDetail" of a student containing fields - account address of students, grades of all semesters, backlog status, Degree verified by HOD or not, Degree verified by Director or not.
    struct SemesterDetail {
    	address account;
    	uint semester1;
    	uint semester2;
    	uint semester3;
    	uint semester4;
    	uint semester5;
    	uint semester6;
    	uint semester7;
    	uint semester8;
        bool active_backlog; 
        bool isHodVerified;
        bool isDirVerified;	
    	}
    
	///@notice This is the structure representig a "HOD" containing fields - account address, Unique ID of HOD, Department, Name, HOD is verified by director or not. 
	struct HOD {
        	address account;  // blockchain address
        	string unqID;
        	uint depart; // 1 = CSE, 2 = MECH, 3= CIVIL, 4= EE
        	string name;
        	bool isHod;
    	}
    	
	///@notice This is the structure representig a "Company" containing fields - Company Registration No, Company Name, account address,Year of Estalblishment, Domain of Work, location of company, company is verified by director or not.
	struct Company {
        	uint CRN_No; //Company Registration Number
        	string Cname; //company name
        	address account; //Blockchain account address
        	string YoE; //Year of Estalblishment
        	string DoW; //Domain of Work
        	string location;
        	bool DirectorApproved; //Flag status of approval by director
    	}

	///@notice This is the structure representig a "CompanyRequest" containing fields - Request Id, Company name, Student Roll No, Request is approved by director or not.   	
    	struct CompanyRequest {
    		uint req_id;
    		string company_name;
    		uint student_roll_no;
    		bool isReqApproved;	
    	
    	}
    	
	///@notice This Mapping is storing the every student's details using struct student and key StudEnrollNo.    	
    	uint public StudEnrollNo = 0;
    	mapping(uint => Student) public Students;

	///@notice This Mapping is storing the every HOD's details using struct HOD and key HodAddressCount.	
    	uint public HodAddressCount = 0;
    	mapping(uint => HOD) public HODs;
    	
	///@notice This Mapping is storing the every Company's details using struct Company and key CompRegNo.	
    	uint public CompRegNo = 0;
    	mapping(uint => Company) public Companies;

 	///@notice This Mapping is storing the every CompanyRequest's details using struct CompanyRequest and key requestId.   	
    	uint public requestId = 0;
    	mapping(uint => CompanyRequest) public CompaniesRequest;
    
 	///@notice This Mapping is storing the every SemesterDetail's details of for every student using struct SemesterDetail and key account address of student.	
    	mapping(address => SemesterDetail) public SemesterDetails;


    ///@notice This "addStudent" function is used Register the Student information onto the college network
  	///@dev Ensuring that address doesn't belong to some other student or Same student with same address may not be able to fill the form 
  	///@dev Here we are mapping Students with structure Student with repect to StudEnrollNo
  	///@dev Also we are mapping SemesterDetails with structure SemesterDetail with repect to _account.
  	///@param _name is the Name of the Student who is registering for degree verification
  	///@param _StudRollNo is the roll number of student
  	///@param _depart is Department of Student
  	///@param _program is Program in which student is enrolled
  	///@param _doj is Date on which Student joined the college 
  	///@param _HODVerified is flag which tells whether student information is verifed by HOD or not
  	///@param _DirectorVerified is flag which tells whether student information is verifed by Director or not	
	function addStudent(string memory _name,string memory _StudRollNo, uint _depart, uint _program, string memory _doj, bool _HODVerified, bool _DirectorVerified) public {
		
		
		bool _flag = true;
		for(uint i=1; i<=StudEnrollNo; i++){
			Student memory _Student = Students[i];
			if(msg.sender == _Student.account)
			{_flag = false;}
		
		}
		
		require(_flag);
		require(msg.sender!= Director);
		
		
		
    		StudEnrollNo ++;
    		address _account = msg.sender;
    		Students[StudEnrollNo] = Student(_account,StudEnrollNo , _StudRollNo, _name, _depart, _program, _doj, _HODVerified, _DirectorVerified);
    		
    		SemesterDetails[_account] = SemesterDetail(_account, 0, 0, 0, 0, 0, 0, 0, 0, false, false, false);
  	}

	///@notice This "addHOD" function is used by faculties to apply for a HOD position in particular department to a director. 
	///@dev Ensuring that this account address who is requesting as a faculty doesn't belong to any student.
	///@dev	Also Ensuring this account address doesn't have requested for HOD position earlier. i.e. We're ensuring faculty can be request and registered only once for any department.
	///@param _depart is a integer representing department. 1 = CSE, 2 = MECH, 3= CIVIL, 4= EE
	///@param _name is the name of the faculty who is requesting for HOD position.
	///@param _unqID is a unique id representing request number of the faculty's request
	///@param _isHod is flag initialized to false representing he is not verified by director as a HOD yet.
  	function addHOD(uint _depart,string memory _name, string memory _unqID, bool _isHod) public {
    	bool _Student_flag = true;
		for(uint i=1; i<=StudEnrollNo; i++){
			Student memory _student = Students[i];
			if(msg.sender == _student.account)
			{_Student_flag = false;}
		}
		
		require(_Student_flag);
    		
    	bool _flag = true;
		for(uint i=1; i<=HodAddressCount; i++){
			HOD memory _HOD = HODs[i];
			if(msg.sender == _HOD.account)
			{_flag = false;}
		}
    		require(_flag);
    		require(_depart<=4 && _depart>0);
    		
    		
    		HodAddressCount++;
    		address _account = msg.sender;
    		HODs[HodAddressCount] = HOD(_account,_unqID,_depart, _name, _isHod);

  	}
	
	///@notice This "addCompany" function is used to Register Company onto the college network.
	///@dev Ensuring that company details are already present in the blockchain network or not. 
	///@dev Here we are mapping Companies with structure Company with repect to CompRegNo 
	///@param _Cname is the Company name of the Company who want to register themself for viewing the Student information.
	///@param _YoE is Year of Establishment of the company
	///@param _DoW is Domain of work on which company is currently working
	///@param _location is the place where the company is currently located.
	///@param _DirectorApproved is flag which tells whether the company is currently verfied	
	function addCompany(string memory _Cname, string memory _YoE, string memory _DoW,string memory _location, bool _DirectorApproved) 		public {
		
		bool _flag = true;
		for(uint i=1; i<=CompRegNo; i++){
			Company memory _Company = Companies[i];
			if(msg.sender == _Company.account)
			{_flag = false;}
		}
    		require(_flag);
    		
    		CompRegNo ++;
    		address _account = msg.sender;
    		Companies[CompRegNo] = Company(CompRegNo,_Cname, _account, _YoE, _DoW, _location, _DirectorApproved);

  	}  
  	
  	
  	// Verify and assign HODs 
	///@notice This "Verify_HOD" function is used by the Director to verify the HOD based on his request number which mapped with HOD's details.
	///@dev Here, we're ensuring that this function is accessed by only Director's account address and atleast one Faculty has applied for a HOD position.
	///@dev Based on department number we're assigning this HOD's account address as the account address of CSE_Hod/MECH_Hod/CIVIL_Hod/EE_Hod	
	///@param _id is the unique id representing the HODs request number send to the director for verification.
  	function Verify_HOD(uint _id) public {
  	
	  	require(msg.sender == Director && HodAddressCount>0);
	  	
	  	HOD memory _hod = HODs[_id];
	  	_hod.isHod = true;
	  	HODs[_id] = _hod;
	  	
	  	if(_hod.depart == 1)
	  	{
	  	    CSE_Hod = _hod.account;
	  	}
	  	
	  	else if(_hod.depart == 2)
	  	{
	  	    MECH_Hod = _hod.account;
	  	}
	  	else if(_hod.depart == 3)
	  	{
	  	    CIVIL_Hod = _hod.account;
	  	}
	  	else if(_hod.depart == 4)
	  	{
	  	    EE_Hod = _hod.account;
	  	}
  	
  	}
  	
  	
   	///@notice This "Approve_Company" by Director to verify the Companies identity based on their CRN nunber
  	///@dev Here, We are ensuring that this function is only accessed by Director account
  	///@dev making "DirectorApproved" flag declared inside Company to true.
  	///@param _id is the unique ID/Company Registration number of the Company whose identity as a Company has to be verified by Director
  	function Approve_Company(uint _id) public {
  	
  	
	  	require(msg.sender == Director && CompRegNo>0);
	  	
	  	Company memory _company = Companies[_id];
	  	_company.DirectorApproved = true;
	  	Companies[_id] = _company;
  	
  	
  	}
  	
	///@notice This "Company_RequestforStudent" function is used by company to send the request to director for viewing particular student's degree information.
	///@dev Here, first we're ensuring that the roll no and account address passed by company belongs to the same student and is valid.
	///@dev Also ensuring that the company who is requesting for degree information is registered and verified by director.
	///@param _Saccount is account address of the student whose degree information company want to see. 
	///@param _SrollNo is Roll No of the student whose degree information company want to see.
  	function Company_RequestforStudent(address _Saccount, uint _SrollNo) public
  	{
  	
  		Student memory _student = Students[_SrollNo];
  		string memory _ComapanyName ="";
  		bool _flag = false;
		for(uint i=1; i<=CompRegNo; i++){
			Company memory _Company = Companies[i];
			if(msg.sender == _Company.account){
				if(_Company.DirectorApproved == true)
				{
					_flag = true;
					_ComapanyName = _Company.Cname;
				}
			}
		}
    		require(_flag);
  		
  		address _account = msg.sender;
  		
  		//Ensuring Account Address and Roll No sent by Company matches with existing student's corrosponding roll no.
  		require(_student.account == _Saccount);
  		
  		
  		requestId++;
  		CompaniesRequest[requestId] = CompanyRequest(requestId, _ComapanyName, _SrollNo , false);			
  	}

  	// Director approval for companies request for student
  	///@notice This "Approve_CompanyRequest" function is used to approve request of company for viewing information of student which they had requested by Director
  	///@dev Here, we're checking if the current looged account if equal to Directors account or not and  also making "isReqApproved" flag declared inside CompanyRequest to true.
  	///@param _req_id is the request ID of company to view information of the student 
	function Approve_CompanyRequest(uint _req_id) public
  	{
  		CompanyRequest memory _company = CompaniesRequest[_req_id];
  		
  		require(msg.sender == Director);
  		_company.isReqApproved = true;
  		
  		CompaniesRequest[_req_id] = _company;	
  	
  	}

  	
	///@notice This "Update_SemesterGrades" function is for verified students to update their all 8 semester's grade and backlog status on the blockchain.
	///@dev Here, first we're checking the "metamask blockchain account" which is requesting this function belongs some registered & verified student using loop. If its true then only we're updating his all semester grade details using a mapping named "SemesterDetails" whose key is student's account address.
	///@param _sem1 CPI grade of semester 1 
	///@param _sem2 CPI grade of semester 2
	///@param _sem3 CPI grade of semester 3
	///@param _sem4 CPI grade of semester 4
	///@param _sem5 CPI grade of semester 5
	///@param _sem6 CPI grade of semester 6
	///@param _sem7 CPI grade of semester 7
	///@param _sem8	CPI grade of semester 8
	///@param _backlog True/False value representing student is having any backlog or not; True - means student have backlog
 	function Update_SemesterGrades(uint _sem1, uint _sem2, uint _sem3, uint _sem4, uint _sem5, uint _sem6,uint _sem7, uint _sem8, bool _backlog ) public
  	{
  		bool flag = false;
  		address _account = msg.sender;
  		//Student memory _student = Students[_id];
  		for(uint i=1; i<=StudEnrollNo; i++){
			Student memory _Student = Students[i];
			if(msg.sender == _Student.account)
			{flag = true;}
		
		}
  		
  		require(flag);
  		
  		
  		SemesterDetails[_account] = SemesterDetail(_account, _sem1, _sem2, _sem3, _sem4, _sem5, _sem6, _sem7, _sem8, _backlog, false,false);	
  		
  	}
	
	
	///@notice This "VerificationByHODs" function is used by HOD to verify the students identity of their deparment based on the roll number.
	///@dev Here, we're making "HODVerified" flag declared inside the Student struct "true" if department of Students matches with their respective HOD's global address.
	///@param _id is Roll number of student whose identity as a Student has to be verified by thier respective hods
	function VerificationByHODs(uint _id) public
	{
		
		address _account = msg.sender;
		require(_account == CSE_Hod || _account == MECH_Hod || _account == CIVIL_Hod || _account == EE_Hod);
		
		Student memory _student = Students[_id];
		_account = _student.account;
		SemesterDetail memory _student_detail = SemesterDetails[_account];
  		uint dept = _student.depart;
  		require(_student_detail.active_backlog == false);
  		
  		if(dept == 1 && _account == CSE_Hod)
  		{
  			_student.HODVerified = true;
  			
  		}
  		
  		if(dept == 2 && _account == MECH_Hod)
  		{
  			_student.HODVerified = true;
  			
  		}
  		
  		if(dept == 3 && _account == CIVIL_Hod)
  		{
  			_student.HODVerified = true;
  			
  		}
  		
  		if(dept == 4 && _account == EE_Hod)
  		{
  			_student.HODVerified = true;
  			
  		}
  				
		Students[_id]= _student;
	
	}
	
	///@notice This "Student_VerificationByDirector" function is used by director to verify the student's identity based on his roll_no.
	///@dev Here, we're ensuring this function is only accessed by Director's account address.
	///@dev Also, we're making the "DirectorVerified" flag declared inside the Student struct "true" for verification. To persist this change we're updating the value of struct Student on the mapping named "Students" on the key roll_no passed by director as a _id.
	///@param _id is a Roll number of student whose identity as a Student has to be verified by Director. 
	function Student_VerificationByDirector (uint _id) public
	{
		require(msg.sender == Director);
		
		Student memory _student = Students[_id];
		bool isHODverified = _student.HODVerified;
		
		require(isHODverified);
	
		_student.DirectorVerified = true;
		
		Students[_id]= _student;
	
	}
	
	
	///@notice This "All_Data_Verification" function is used to verify degree details by their respective HODs and Director
	///@dev Ensuring that this function is only accessed by Director and Students's respective HODs 
	///@dev here we are making isHodVerified flag to true/fasle if account is currently logged by Hod in metamask
	///@dev here we are making isDirVerified flag to true/false if account is currently logged by Hod in metamask
	///@param _id is Roll number of the student whose degree details is to be verified by director and hod. 
	function All_Data_Verification(uint _id) public
	{
	
		require(msg.sender == Director || msg.sender == CSE_Hod || msg.sender == MECH_Hod || msg.sender == CIVIL_Hod || msg.sender == EE_Hod);
		Student memory _student = Students[_id];
		address _account = _student.account;
		SemesterDetail memory _student_detail = SemesterDetails[_account];
		
		
		if(msg.sender == CSE_Hod || msg.sender == MECH_Hod || msg.sender == CIVIL_Hod || msg.sender == EE_Hod)
		{
			if(_student.HODVerified == false && _student_detail.isHodVerified == false)
			{
			
				_student.HODVerified = true;
				Students[_id] = _student;
			
			}
			
			else if(_student.HODVerified == true && _student_detail.isHodVerified == false)
			{
			
				_student_detail.isHodVerified = true;
				SemesterDetails[_account] = _student_detail;
			
			}
		
		
		
		}
		
		else if(msg.sender == Director)
		{
			if(_student.HODVerified && _student.DirectorVerified == false && _student_detail.isDirVerified == false)
			{
			
				_student.DirectorVerified = true;
				Students[_id] = _student;
			
			}
			
			else if(_student.DirectorVerified && _student.DirectorVerified == true && _student_detail.isDirVerified == false)
			
			{
				_student_detail.isDirVerified = true;
				SemesterDetails[_account] = _student_detail;
		
			
			}
					
		
		}	
	
	
	}
	
	
}
