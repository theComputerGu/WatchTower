namespace Backend.Config;

//this file contains what need to be when JWT create.
//Jwt is the token when user gets when he entering to the system
public class JwtSettings
{
    //the secret key that making the signature of the token and also cheking the token - unsigneture
    public string Secret { get; set; } = null!;

    //how many time there are for the JWT key
    public int ExpirationMinutes { get; set; }
}
