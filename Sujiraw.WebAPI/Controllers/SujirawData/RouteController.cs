using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiro.Data;
using Sujiro.WebAPI.Service.AuthService;
using Sujiro.WebAPI.SignalR;
using Route = Sujiro.Data.Route;
namespace Sujiro.WebAPI.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
//    [Authorize]

    public class RouteController : SujiroAPIController
    {
        public RouteController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }
        [HttpGet("{companyID}")]
        public async Task<ActionResult> Get(long companyID)
        {
            try
            {
                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using (var service = new PostgresDbService(connectionString))
                {
                    var routes= service.GetFromCompany(companyID);
                    return Ok(routes);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{companyID}")]
        public async Task<ActionResult> Update(long companyID, [FromBody] Route route)
        {
            return NotFound();
        }
        [HttpDelete("{companyID}/{routeID}")]
        public async Task<ActionResult> Delete(long companyID, long routeID)
        {
            return NotFound();
            // todo

            //if (!AuthService.HasAccessPrivileges(Configuration["ConnectionStrings:DBdir"], User, companyID))
            //{
            //    return Forbid();
            //}
            try
            {

                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using (var service = new PostgresDbService(connectionString))
                {
                    var companies = service.GetAllCompany();
                    return Ok(companies);
                }
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

    }
}
