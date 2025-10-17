import service from "@/utils/request.js";



export function getMembershipPlans(params) {
  return service({
    url: '/membershipPlans',
    method: 'get',
    params
  })
}
